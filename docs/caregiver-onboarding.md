# Caregiver Onboarding

## Problem

When a user first signs up / in via the authentication provider, we have no information about them. We need to collect their details to create a caregiver profile.

## Solution

When a user first signs up or logs in, they are redirected to the `/caregiver/new` onboarding page. This page will collect the necessary information to create a caregiver profile.

### Login Sequence

```mermaid
sequenceDiagram
		actor Caregiver
		participant Frontend
		participant AuthHandler
		participant SingpassClient
		actor Singpass

		Caregiver->>Frontend: Login with Singpass Button onclick()
		activate Frontend
		Frontend->>AuthHandler: get("/api/singpass/auth-url")
		activate AuthHandler
		AuthHandler->>SingpassClient: authorizationUrl()
		activate SingpassClient
		SingpassClient-->>AuthHandler: authorizationUrl
		deactivate SingpassClient
		AuthHandler-->>Frontend: authorizationUrl
		deactivate AuthHandler
		Frontend->>Singpass: Redirect to Singpass for authentication
		deactivate Frontend
		activate Singpass
		Singpass-->>Frontend: exchangeToken
		activate Frontend
		deactivate Singpass
		Frontend->>AuthHandler: get("/api/redirect", exchangeToken)
		activate AuthHandler
		AuthHandler->>SingpassClient: verifyToken(exchangeToken)
		activate SingpassClient
		SingpassClient-->>AuthHandler: userDetails
		deactivate SingpassClient
		AuthHandler->>AuthHandler: signJWT(userDetails)
		AuthHandler-->>Frontend: authToken
		deactivate AuthHandler
		Frontend->>Frontend: setLocalStorage(authToken)
		Frontend->>Frontend: redirect("/dashboard")
		Frontend->>Caregiver: Dashboard page
		deactivate Frontend

```

### Caregiver Onboarding Sequence

```mermaid
sequenceDiagram
		actor Caregiver
		participant Frontend
		participant CaregiverHandler
		participant CaregiverEntity

		Caregiver->>Frontend: Navigate to initialPage
		activate Frontend
		Frontend->>CaregiverHandler: get("/api/caregiver/self")
		activate CaregiverHandler
		CaregiverHandler-->>Frontend: caregiverProfile
		deactivate CaregiverHandler

		alt If caregiverProfile not null
			Frontend->>Caregiver: Render initialPage
		else If caregiverProfile is null
			Frontend->>Frontend: redirect("/caregiver/new?next=initialPage")
			Frontend->>Caregiver: Onboarding page
			deactivate Frontend
			Caregiver->>Frontend: Fill in caregiver details (name, phone, address)
			activate Frontend
			Frontend->>CaregiverHandler: post("/api/caregiver/self", caregiverDetails)
			activate CaregiverHandler
			CaregiverHandler->>CaregiverEntity: create(caregiverDetails)
			activate CaregiverEntity
			CaregiverEntity-->>CaregiverHandler: caregiverProfile
			deactivate CaregiverEntity
			CaregiverHandler-->>Frontend: caregiverProfile
			deactivate CaregiverHandler
			Frontend->>Frontend: redirect(initialPage)
			Frontend->>Caregiver: Render initialPage
			deactivate Frontend
		end
```

### Elder Onboarding Sequence

```mermaid
sequenceDiagram
	actor Caregiver
	participant Frontend
	participant ElderHandler
	participant ElderEntity

	Caregiver->>Frontend: Fill in elder details (name, phone, address)
	activate Frontend
	Frontend->>ElderHandler: post("/api/elder/", elderDetails)
	activate ElderHandler
	ElderHandler->>ElderEntity: create(elderDetails)
	activate ElderEntity
	ElderEntity-->>ElderHandler: elderDetails
	deactivate ElderEntity
	ElderHandler-->>Frontend: elderDetails
	deactivate ElderHandler
	Frontend->>Frontend: redirect("/elder/:elderId")
	Frontend->>Caregiver: Render elder details page
	deactivate Frontend
```

### Invite Caregiver Sequence

```mermaid
sequenceDiagram
		actor PrimaryCaregiver
		actor OtherCaregiver
		participant Frontend
		participant ElderHandler
		participant ElderEntity

		PrimaryCaregiver->>Frontend: Navigate to elder details page
		activate Frontend
		Frontend->>ElderHandler: get("/api/elder/invite", elderDetails)
		activate ElderHandler
		ElderHandler->>ElderEntity: get(elderDetails)
		activate ElderEntity
		ElderEntity-->>ElderHandler: elderDetails
		ElderHandler->>ElderHandler: signJWT()
		deactivate ElderEntity
		ElderHandler-->>Frontend: inviteToken
		deactivate ElderHandler
		Frontend->>Frontend: generateInviteLink(inviteToken)
		Frontend->>PrimaryCaregiver: Render elder details page with generateInviteLink
		deactivate Frontend
		PrimaryCaregiver-->>OtherCaregiver: Share inviteLink
		OtherCaregiver->>Frontend: Navigate to inviteLink
		activate Frontend
		Frontend->>OtherCaregiver: Show Accept/Reject Button
		alt OtherCaregiver Accepts Invite
			OtherCaregiver->>Frontend: Accept button onClick()
			Frontend->>ElderHandler: post("api/elder/invite", inviteToken)
			activate ElderHandler
			ElderHandler->>ElderHandler: decodeToken(inviteToken)
			ElderHandler->>ElderEntity: insert(otherCaregiverId, elderId)
			activate ElderEntity
			ElderEntity-->>ElderHandler: txnStatus
			deactivate ElderEntity
			ElderHandler->>Frontend: txnStatus
			deactivate ElderHandler
			Frontend->>OtherCaregiver: Show success/failure msg
		else OtherCaregiver Rejects Invite
			OtherCaregiver->>Frontend: Reject button onClick()
			Frontend->>Frontend: redirect("/dashboard")
			Frontend->>OtherCaregiver: Render dashboard
		end

		deactivate Frontend


```

## Implementation Steps

1. Create `caregivers` table in the database with the following fields:

   - `id`: TEXT, primary key, will be matched with the authentication provider's JWT `sub`
   - `name`: String, required
   - `phone`: String, optional
   - `address`: String, optional
   - `createdAt`: Timestamp, default to current time

2. Create endpoints in the backend:

   - `POST /api/caregiver/self`: Create a new caregiver profile
   - `GET /api/caregiver/self`: Get the current user's caregiver profile

3. Create a frontend page at `/caregiver/new`:

   - Use a form to collect caregiver details (name, phone, address)
   - On form submission, call the `POST /api/caregiver/self` endpoint to create the profile
   - Redirect to the dashboard page upon successful creation

4. Add a `useCaregiver` hook in the frontend to manage caregiver state:
   - Fetch caregiver details using `GET /api/caregiver/self`
   - Provide methods to create and update caregiver details
   - _Redirect to the onboarding page if no caregiver profile exists_

```

```
