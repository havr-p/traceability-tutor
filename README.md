# TraceabilityTutor

## Demo
The application is fully hosted on cloud application hosting services such as Vercel and Render. You can access the application [here](https://traceability-tutor.vercel.app/).   
An application database was populated with demo project and user. You can access a demo project using "Sign in as test user".

## Development

Currently app uses database hosted on Render. You can update your local database connection in `application.yml` or create your own `application-local.yml` file to override
settings for development.

During development it is recommended to use the `local` profile. In IntelliJ `-Dspring.profiles.active=local` can be
added in the VM options of the Run Configuration after enabling this property in "Modify options".

Lombok must be supported by your IDE. For IntelliJ install the Lombok plugin and enable annotation processing -
[learn more](https://bootify.io/next-steps/spring-boot-with-lombok.html).

After starting the application is accessible under `localhost:8080`.


## Build

The application can be built using the following command:

```
mvnw clean package
```

Start your application with the following command - here with the profile `production`:

```
java -Dspring.profiles.active=production -jar ./target/traceability-tutor-0.0.1-SNAPSHOT.jar
```

To run the frontend locally run following commands:
```
cd frontend/traceability_tutor
npm i
npm start
```


## Further readings

* [Maven docs](https://maven.apache.org/guides/index.html)
* [Spring Boot reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
* [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
