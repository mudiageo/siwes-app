import { query, getRequestEvent, form, command } from '$app/server'

import { signIn, createUser } from '$lib/server/auth'

export const login = form(async (data) => {
  try {
    const event = getRequestEvent()
    event.request.formData = () => data
    await signIn(event)
  }catch(e) {
    const errCode = e.cause?.err?.code
    let error = "An error occurred, please try again."
    
    switch (errCode) {
		  case 'unverified_email':
				error = 'Email must be verified';
				break;
			case 'account_not_found':
				error = 'No account associated with this email';
				break;
			case 'invalid_credentials':
				error = 'Invalid credentials';
				break;
		  }
    
    return {
      error
    }
  }
})

export const register = form(async (formData) => {
  		try {
  		  const data = Object.fromEntries(formData);
  		  console.log(data)
			const result = await createUser({
				...data,
				name: `${data?.firstName} ${data?.lastName}`,
			});
			
		if(data.userType === 'student')	{
		  
		  await db.insert(students).values({
		    userId: result.user.id,
		    firstName: data.firstName,
		    lastName: data.lastName,
		    university: data.university,
		    department: data.department,
		    level: data.level,
		    location: data.location
		  })
		} else if(data.userType === 'company')	{
		  await db.insert(companies).values({
		    userId: result.user.id,
		    name: data.name,
		    industry: data.industry,
		    location: data.location,
		    size: data.size,
		    description: data.description
		    
		  })
		}
		  

			if (!result.success) return { error: result.error }
		} catch (error) {
			return {
				error: 'Signup failed',
			};
		}

		// log the user in
		const event = getRequestEvent()
    event.request.formData = () => formData
    await signIn(event)
    
})
