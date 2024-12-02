# Matt Barn - Past Experience with Examples
## Trinny London - Full Stack Engineer
### trinnylondon.com - 2022-2024
#### Tech
##### Front-end
CSS
Cypress
ESLint
ReactJS
Redux
##### Backend
AWS Lambda
NodeJS
##### General
Bash
CircleCI
CommerceTools
Confluence
Contentful
Docker
Git
Google Analytics
Jest
Jira
LaunchDarkly
MacOS
NPM
Ometria
Postman
Sonarcloud
TypeScript
#### Overview
My role at Trinny London was roughly split 70% front-end and 30% back-end work.
The front-end was a single react and typescript-based repository.
The back-end comprised multiple predominantly typescript-based repositories, most of which were written in node, as well as some AWS Lambdas and some for data processing.
One of the back-end repositories was deployed as an API layer between the front-end and other back-end services.
The overall goal was to ensure the day-to-day running of the e-commerce website and its associated services, implementing various new features to improve user experience and launch new products.
#### Example 1 - PII Changes and Ometria Notifications Lambda
Following an audit which determined that PII was publicly exposed after successful customer orders, I was responsible for rewriting the order confirmation screen of the web application to no longer expose any PII if a customer was not logged in.
As a result of this change, the process by which PII was sent to an AWS Lambda which would trigger confirmation emails to be sent to customers was broken.
I rewrote the typescript repository which contained this and related AWS Lambda functions to retrieve its data via a different API request.
This involved creating and updating a number of custom types, fixing a large number of type errors, and performing extensive testing.
Upon completion, the new Lambda function was deployed to production and seamlessly replaced the preexisting system.
#### Example 2 - Node 14 to 18 upgrade
I led the work to upgrade several major node versions at once for two critical repositories: the main website, and the API layer.
This involved researching which functions and components had changed behaviour in versions 15-18, and ensuring that all existing usage of these functions was coded around or removed.
I encountered substantial performance degradation when first upgrading to node 18, which required in-depth investigation and pair programming to determine the cause and fix: a redundant and now broken flag which was causing all functions to run sequentially instead of concurrently.
Coverage and consistent pass rate of both unit and integration tests also had to be verified before the upgrade was deployed to production.
Once deployed, overall build times improved for the main web application, and several other dependent libraries were able to be upgraded to more secure versions.
#### Example 3 - Navigation Redesign
A substantial piece of work which I assisted with was a major redesign of the navigation system for the web application.
This redesign was both from a usability and technological perspective, with significant work around reducing code duplication, fixing bugs, removing messy and poorly written code, and implementing a newer, more accessible design.
As a part of this, I assisted with user testing sessions, making notes of any uncertainty or confusion faced by users and feeding this back to the UX design team.
I worked closely with a colleague to optimise and eventually replace the website's top search bar, which previously contained multiple conflicting styling and logic rules, resulting in a more responsive component.
#### Example 4 - Misc Code Improvements
In addition to leading the node upgrade work, I was an advocate for consistent optimisation, deduplication, increasing of test coverage and removal of redundant code.
When time allowed, or when my code changes already touched an area of the application which could be improved, I regularly would update types, add missing unit tests, or remove no-longer-in-use functions from the code base.
I would also often tweak CircleCI's parameters to speed up build times and test runs, as well as to avoid allocating unnecessarily high resource values to build pipeline steps which did not require as much memory or CPU.
## BAE Systems Digital Intelligence - Software Engineer
### Government Security Projects - 2020-2022
#### Tech
##### Front-end
Axe
CSS
Cucumber
Enzyme
ESLint
Gherkin
HTML
JavaScript
Jest
ReactJS
React Router
React Testing Library
Redux
Redux-Saga
SASS
SCSS
TypeScript
WAVE
Webpack
##### Backend
Java
Spring Boot
##### General
Bash
Confluence
Git
GitLab
HashiCorp Vault
Jira
Kubernetes
Linux
Minikube
NPM
SonarQube
#### Overview
My role within the Government Security Projects was roughly split 80% front-end and 20% back-end work.
The front-end was a single react and typescript-based repository; typescript was brought in early on to replace JavaScript.
The back-end comprised multiple java-based repositories, some of which utilised the spring boot framework, which were largely responsible for processing of data.
There were also several specific testing repositories based on cucumber, gherkin, and java.
The overall goal was to build a new system to replace a late-90s/legacy system used by the Home Office for inputting border control data and determining risk.
#### Example 1 - Accessibility Improvements
I spearheaded accessibility as a core requirement of the overall UI design.
Through a combination of running the WAVE tool against the UI via a browser extension, as well as integrating Axe into the front-end application and its tests, I was able to demonstrate limitations and implement stricter accessibility requirements within the team.
I also ensured that the full application was usable (without options missing from the screen) at all zoom levels up to 400%, without breaking with the Gov.uk design paradigm.
I demonstrated all of these changes to the client.
##### Relevant files
axe.config.js
axe.ts
index.spec.tsx
#### Example 2 - Various Spring Boot Data Changes
Although at any time there were between 2 and 4 Java-specific developers on the team, I had to ensure that various back-end services were set up to send and receive data of the correct types and structures to be usable by the front-end.
This involved not just modifying or creating new objects and classes, but also creating and modifying relevant test data to ensure edge cases could be handled in the event of non-mandatory fields.
##### Relevant files
identityMultipleTwoRecordsUISearch.json
OrganisationDTO.java
OrganisationTest.java
RecordRequest.java
### Unauthorised Trading Detection Program - 2018-2019
#### Tech
##### Front-end
JavaScript
XML
##### Back-end
DataServer
Jenkins
Oracle
SAS
SQL
##### General
Bash
CentOS
Confluence
DbVisualiser
Excel
Jira
Mercurial
NetReveal
#### Overview
My role within the Unauthorised Trading Detection Program was roughly split 50% front-end and 50% back-end work.
The front-end was based on a customised deployment of BAE's NetReveal platform, which was editable through either a UI admin panel or via changing XML, with some graphical components and unit tests written in JavaScript.
The back-end written using DataServer/SAS and Oracle SQL.
The overall goal was to develop new features and extend existing functionality for the purpose of analysing a bank's trading data in order to identify unauthorised or suspicious activity.
#### Example 1 - Performance Improvement
A requirement came from the client to reduce overnight data processing times.
I worked closely with the team's system architect to implement and perform testing on a new approach for partitioning data by region using SQL to allow for better concurrency.
Deploying this required modification to Jenkins configuration scripts, DataServer code, and SQL pre-processing code files.
#### Example 2 - Data Quality Reports
I facilitated both automated and manual data review processes for the purposes of demonstrating the platform's effectiveness to the client.
This involved extensive modification to DataServer/SAS files, data normalisation and cleanup, and complex Excel queries.
Once prepared, I carried out explanatory calls with the client to explain the data analysis and the efficacy of the system.