import { query, getRequestEvent, form, command } from '$app/server'

import { signIn, createUser } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { students, companies} from '$lib/server/db/schema'

export const login = form(async (data) => {
  // try {
    const event = getRequestEvent()
    event.request.formData = () => data
    await signIn(event)
  // }catch(e) {
  //   console.log(e)
  //   const errCode = e.cause?.err?.code
  //   let error = "An error occurred, please try again."
    
  //   switch (errCode) {
		//   case 'unverified_email':
		// 		error = 'Email must be verified';
		// 		break;
		// 	case 'account_not_found':
		// 		error = 'No account associated with this email';
		// 		break;
		// 	case 'invalid_credentials':
		// 		error = 'Invalid credentials';
		// 		break;
		//   }
    
  //   return {
  //     error
  //   }
  // }
})

export const register = form(async (formData) => {
  		try {
  		  const data = Object.fromEntries(formData);
  		  console.log(data)
			const result = await createUser({
				...data,
				name: `${data?.firstName} ${data?.lastName}`,
			});
			console.log(result)
			if (!result.success) return { error: result.error }
			
		if(data.userType === 'student')	{
		  
		  await db.insert(students).values({
		    userId: result.user.id,
		    firstName: data.firstName,
		    lastName: data.lastName,
		    university: data.university,
		    department: data.department || "Computer Engineering",
		    level: data.level || "300",
		    location: data.location || "Benin"
		  })
		} else if(data.userType === 'company')	{
		  await db.insert(companies).values({
		    userId: result.user.id,
		    name: data.companyName,
		    industry: data.industry,
		    location: data.location || "Benin",
		    size: data.size || "30",
		    description: data.description 
		    
		  })
		}
		  

		} catch (error) {
		  console.log(error)
			return {
				error: 'Signup failed',
			};
		}

		// log the user in
		const event = getRequestEvent()
    event.request.formData = () => formData
    await signIn(event)
    
})
