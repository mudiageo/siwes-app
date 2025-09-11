import { query, form, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { messages, applications, placements, companies, students, users } from '$lib/server/db/schema.js';
import { eq, desc, and, or } from 'drizzle-orm';

// Get messages for an application
export const getApplicationMessages = query(v.string(), async (applicationId: string) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  // Verify user has access to this application
  const [application] = await db
    .select({
      application: applications,
      placement: placements,
      student: students,
      company: companies
    })
    .from(applications)
    .innerJoin(placements, eq(applications.placementId, placements.id))
    .innerJoin(students, eq(applications.studentId, students.id))
    .innerJoin(companies, eq(placements.companyId, companies.id))
    .where(eq(applications.id, applicationId));

  if (!application) {
    throw new Error('Application not found');
  }

  // Check access permissions
  const hasAccess = 
    (session.user.userType === 'student' && application.student.userId === session.user.id) ||
    (session.user.userType === 'company' && application.company.userId === session.user.id);

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  // Get messages
  const applicationMessages = await db
    .select({
      message: messages,
      sender: users
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.applicationId, applicationId))
    .orderBy(messages.sentAt);

  // Mark messages as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.applicationId, applicationId),
      eq(messages.isRead, false),
      // Don't mark own messages as read
      // ne(messages.senderId, session.user.id)
    ));

  return { 
    messages: applicationMessages, 
    application: {
      ...application.application,
      placement: application.placement,
      student: application.student,
      company: application.company
    }
  };
});

// Send message
export const sendMessage = form(async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const applicationId = data.get('applicationId') as string;
  const content = data.get('content') as string;

  if (!content || content.trim() === '') {
    throw new Error('Message content is required');
  }

  // Verify user has access to this application
  const [application] = await db
    .select({
      application: applications,
      placement: placements,
      student: students,
      company: companies
    })
    .from(applications)
    .innerJoin(placements, eq(applications.placementId, placements.id))
    .innerJoin(students, eq(applications.studentId, students.id))
    .innerJoin(companies, eq(placements.companyId, companies.id))
    .where(eq(applications.id, applicationId));

  if (!application) {
    throw new Error('Application not found');
  }

  // Check access permissions
  const hasAccess = 
    (session.user.userType === 'student' && application.student.userId === session.user.id) ||
    (session.user.userType === 'company' && application.company.userId === session.user.id);

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  // Create message
  const [message] = await db.insert(messages).values({
    applicationId,
    senderId: session.user.id,
    content: content.trim()
  }).returning();

  return { success: true, messageId: message.id };
});

// Get conversation list
export const getConversations = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  let conversations;

  if (session.user.userType === 'student') {
    const student = session.user.profile;
    if (!student) throw new Error('Student profile not found');

    // Get applications with latest messages
    conversations = await db
      .select({
        application: applications,
        placement: placements,
        company: companies,
        latestMessage: {
          id: messages.id,
          content: messages.content,
          sentAt: messages.sentAt,
          senderId: messages.senderId,
          isRead: messages.isRead
        }
      })
      .from(applications)
      .innerJoin(placements, eq(applications.placementId, placements.id))
      .innerJoin(companies, eq(placements.companyId, companies.id))
      .leftJoin(messages, eq(messages.applicationId, applications.id))
      .where(eq(applications.studentId, student.id))
      .orderBy(desc(messages.sentAt));

  } else {
    const company = session.user.profile;
    if (!company) throw new Error('Company profile not found');

    // Get applications to company placements with latest messages
    conversations = await db
      .select({
        application: applications,
        placement: placements,
        student: students,
        latestMessage: {
          id: messages.id,
          content: messages.content,
          sentAt: messages.sentAt,
          senderId: messages.senderId,
          isRead: messages.isRead
        }
      })
      .from(applications)
      .innerJoin(placements, eq(applications.placementId, placements.id))
      .innerJoin(students, eq(applications.studentId, students.id))
      .leftJoin(messages, eq(messages.applicationId, applications.id))
      .where(eq(placements.companyId, company.id))
      .orderBy(desc(messages.sentAt));
  }

  // Group by application and get the latest message for each
  const conversationMap = new Map();
  
  conversations.forEach(conv => {
    const appId = conv.application.id;
    
    if (!conversationMap.has(appId)) {
      conversationMap.set(appId, {
        application: conv.application,
        placement: conv.placement,
        ...(session.user.userType === 'student' ? { company: conv.company } : { student: conv.student }),
        latestMessage: conv.latestMessage,
        unreadCount: 0
      });
    }
    
    // Count unread messages not sent by current user
    if (conv.latestMessage && !conv.latestMessage.isRead && conv.latestMessage.senderId !== session.user.id) {
      conversationMap.get(appId).unreadCount++;
    }
  });

  return { conversations: Array.from(conversationMap.values()) };
});

// Mark conversation as read
export const markConversationAsRead = command(v.string(), async (applicationId) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  // Mark all messages in this conversation as read (except own messages)
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.applicationId, applicationId),
      eq(messages.isRead, false),
      // Don't mark own messages as read - they're automatically read when sent
      // ne(messages.senderId, session.user.id)
    ));

  return { success: true };
});
