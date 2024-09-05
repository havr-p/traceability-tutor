# TraceabilityTutor

## Demo
The application frontend is fully hosted on cloud application hosting service named Vercel. Backend can now run only locally. For detailed instructions on installation see next sections.
## Development

Currently app uses database hosted inside Docker container. You can update your local database connection in `application.yml` or create your own `application-local.yml` file to override
settings for development.

During development it is recommended to use the `local` profile. In IntelliJ `-Dspring.profiles.active=local` can be
added in the VM options of the Run Configuration after enabling this property in "Modify options".

Lombok must be supported by your IDE. For IntelliJ install the Lombok plugin and enable annotation processing -
[learn more](https://bootify.io/next-steps/spring-boot-with-lombok.html).

After starting the application is accessible under `localhost:8080`.


# Setup Guide

## Build


### Server setup

To run the server, you need to have Docker installed on your system. The server and database are combined using Docker Compose.

To start the server and database run 2 following commands from the project root:

```bash
docker-compose up --build
```

To stop and remove the containers:

```bash
docker-compose down
```
## Angular client setup

You need to have npm and node installed on your system. To run the frontend locally, execute the following 3 commands:
1. From project root go to directory that contains frontend files: 
```bash
cd frontend/traceability_tutor
```
2. Install all needed dependencies:
```bash
npm install
```
3. Build Angular project and start development server:
```bash
npm start
```

4.  App server api is exposed using swagger. After server start you can access it via `http://localhost:8080/swagger-ui/index.html`. You can use OpenAPI spec with [orval](https://orval.dev/overview) to automatically generate DTOs and models on client, so interfaces used on frontend will always be synchronized with server models.

### Local testing

A test project with sample data has been prepared to allow users to evaluate the application. To access this project:

1. Launch the application as described in the Build and Server Setup sections.
2. On the login page, click the "Sign in as test user" button.

This will log you in as a local user with access to the pre-configured test project, allowing you to explore the features and functionality of the application without setting up your own data.

## Automatic code mapping
The application offers automatic mapping between requirements and implementation artifacts with the help of Git. To create code artifacts, we use commits.  
Each code artifact contains one or more commits. To automatically includecode artifacts in the current hierarchy, the user should click Data -> Fetch code items. The application will then use the GitHub API to find relevant commits in the repository specified in the project configuration and include them in the hierarchy.   For a commit to be included in the hierarchy, it must be pushed to the remote GitHub repository and contain a special substring tt[id1] in its message, where id1 is the arbitrary ID of a requirement, which the user can find in the top left corner of each item.   Multiple identifiers for connected requriements can also be entered like this: tt[id1 id2 id3]




## Further readings

* [Maven docs](https://maven.apache.org/guides/index.html)
* [Spring Boot reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
* [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
