# TraceabilityTutor

## Demo
The application is fully hosted on cloud application hosting services such as Vercel and Render. You can access the application [here](https://traceability-tutor.vercel.app/).   
An application database was populated with demo project and user. You can access a demo project using "Sign in as test user".

## Development

Currently app uses database hosted inside Docker container. You can update your local database connection in `application.yml` or create your own `application-local.yml` file to override
settings for development.

During development it is recommended to use the `local` profile. In IntelliJ `-Dspring.profiles.active=local` can be
added in the VM options of the Run Configuration after enabling this property in "Modify options".

Lombok must be supported by your IDE. For IntelliJ install the Lombok plugin and enable annotation processing -
[learn more](https://bootify.io/next-steps/spring-boot-with-lombok.html).

After starting the application is accessible under `localhost:8080`.


# Traceability Tutor Setup Guide

## Build

To run the frontend locally, execute the following commands:

```bash
cd frontend/traceability_tutor
npm install
npm start
```

## Server Setup

To run the server, you need to have Docker installed on your system. The server and database are combined using Docker Compose.

To start the server and database:

```bash
docker-compose up --build
```

To stop and remove the containers:

```bash
docker-compose down
```

## Local Testing

A test project with sample data has been prepared to allow users to evaluate the application. To access this project:

1. Launch the application as described in the Build and Server Setup sections.
2. On the login page, click the "Sign in as test user" button.

This will log you in as a local user with access to the pre-configured test project, allowing you to explore the features and functionality of the application without setting up your own data.

#to disable Hyper-V run:  
#Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All  
#to enable it back:  
#Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All  
#restart is required after each command


## Further readings

* [Maven docs](https://maven.apache.org/guides/index.html)
* [Spring Boot reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
* [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
