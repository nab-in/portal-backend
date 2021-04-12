## PORTAL BACKEND ENTITIES

#### USER 
	- Id
	- Email
	- Password
	- Name
	- VerificationStatus
	- UserType
	- dateJoined
	- lastLogin
	- PasswordResetter
	- Profile(Foreign)[nulluble]
	- Company(Foreign)[nullable]
	- Role(Foreign)

### COMPANY
	- Name
	- Email
	- Password
	- VerificationStatus(Verifying Account)
	- PasswordResetter
	- CompanyProfile(Foreign)

#### SUBSCRIPTIONS
	- Id
	- Name
	- Email
	- Status

#### JOB
	- Id
	- Organisation
	- Location
	- ClosingDate
	- Email
	- Attachment
	- Description

#### CATEGORY 
	- Id
	- CategoryName
	- Description
	- Verified

### SUBCATEGORY
	- Id
	- SubCategoryName
	- Verified
	- categoryId(Foreign)

#### JOBCATEGORY
	- Id
	- Job(Foreigh(JOB))
	- SubCategory(Foreign(SUBCATEGORY))

#### COMPANYPROFILE
	- Id 
	- VerifiedStatus(By an admin)
	- Title
	- Bio
	- Location
	- About
	- Website
	- Logo

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
	- ProfileImage


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
