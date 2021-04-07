## PORTAL BACKEND ENTITIES

#### USER 
	- Id
	- Email
	- Password
	- Name
	- VerificationStatus
	- UserType
	- PasswordResetter
	- Profile(Foreign)[nulluble]
	- Company(Foreign)[nullable]
	- Role(Foreign)

#### SUBSCRIPTIONS
	- Id
	- Name
	- Email
	- Status

#### JOB
	- Id
	- Organisation
	- Location
	- Grade
	- ClosingDate
	- Email
	- Attachment
	- Description

#### CATEGORY 
	- Id
	- CategoryName
	- Description

#### JOBCATEGORY
	- Id
	- Job(Foreigh(JOB))
	- Category(Foreign(CATEGORY))

#### COMPANY
	- Id 
	- Title
	- Bio
	- Location
	- About
	- Website

#### JOBCOMPANY
	- Id
	- Job(Foreign(JOB))
	- Company(Foreign(COMPANY))

#### JOBPROFILE
	- Id
	- Job(Foreign(JOB))
	- Profile(Foreign(PROFILE))

#### PROFILE
	- Id
	- Title
	- Bio
	- Location
	- About
	- WebsiteLink
	- CVlink


#### ROLE
	- Id
	- RoleName
	

#### RIGHT
	- Id
	- Entity
	- Create (Bool)
	- Edit (Bool)
	- Delete (Bool)

#### PERMISSION
	- Id
	- Role(Foreign)
	- Right(Foreign)
