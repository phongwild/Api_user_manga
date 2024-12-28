
# Netflix API 

The Netflix-like Streaming Platform API is a comprehensive RESTful web service that emulates the features of popular OTT (Over-The-Top) streaming platforms. It provides a wide range of functionalities, including user authentication, password reset via email, movie recommendations, movie search, watchlist management, and user streaming history. In addition, the API manages user subscriptions and access to streaming content, ensuring that media streaming is available exclusively to subscribed users.




## API Reference

#### Base URL

```
https://app-netflix-api.vercel.app/
```
### User Routes
All the data to be sent in JSON format in request body.

```http
POST https://app-netflix-api.vercel.app/user/login
```

```http
POST https://app-netflix-api.vercel.app/user/register
```

```http
GET https://app-netflix-api.vercel.app/user/logout
```

```http
POST https://app-netflix-api.vercel.app/user/forgotpassword
```

```http
GET https://app-netflix-api.vercel.app/user/profile
```

| Route | description                       |
| :-------- | :-------------------------------- |
| Login   |   **Required**. Email And Password |
| Register |  **Required**. Username,Email and Password |
| Forgot Password |  **Required**. Email|


### Media Routes
All these routes requires that the user is first logged in. Otherwise it does not allow to access the data.

```http
GET https://app-netflix-api.vercel.app/data/media
```

```http
GET https://app-netflix-api.vercel.app/data/media${mediaid}
```

```http
GET https://app-netflix-api.vercel.app/data/mediawatchlist/${userid}
```

```http
GET https://app-netflix-api.vercel.app/data/media/watchlist/${mediaid}/${userid}
POST https://app-netflix-api.vercel.app/data/media/watchlist/${mediaid}/${userid}
```
```http
POST https://app-netflix-api.vercel.app/data/media/stream/${mediaid}/${userid}
```

```http
GET https://app-netflix-api.vercel.app/data/media/history/${userid}
```

```http
POST https://app-netflix-api.vercel.app/data/media/history/${userid}/${mediaid}
```

```http
GET https://app-netflix-api.vercel.app/data/media/search/${search}
```
```http
GET https://app-netflix-api.vercel.app/data/media/recommend/${userid}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `userid`      | `string` | **Required**. Id of User to fetch |
| `mediaid`      | `string` | **Required**. Id of the specific media to fetch |

#### Note:
1) The watchlist routes and the media streaming can only be accessed if user is logged in and Subscribed
2) In watchlist route the POST request is for adding in the watchlist and GET request for removing from the watchlist


### Subscription Route

```http
POST https://app-netflix-api.vercel.app/subscription/payment
```





## Tech Stack

**Server:** Node, Express

**DataBase:** MongoDB