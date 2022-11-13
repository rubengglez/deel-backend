# Approach

As I usually do on the daily basis, I did TDD to be sure that the endpoints met the requirements.
So, commit by commit, you may see how the challenge evolved.

##  Architecture and and other stuff

I created a folder called `use-cases` that contains the actions that are called from the
`api.js` file. Also a domain folder was created to store the models (I talk more about it later).

Moreover there is a new folder `tests/acceptance` that contains a couple of files:
 - `ApiClient.js`: use to call the API, I used `axios` as dependency here.
 - `acceptance.api.test.js`: where the tests are, I used `Jest` framework.

Regarding transactions, only actions that change the state are under transactions. In the future, we could configure Sequelize to perform queries on replicas and writes in master, improving scalability.

For Admins, I touch the `getProfile` middleware, I use `admin` keyword as means of authenticating the request.

##  Models

I was struggle with `sequelize`, I had to invest some time in understanding how it works.
I am not a fan of ActiveRecord approach and due to time constraints I don't polish the
models.js file as I wanted. An improvement here would be to extract the different models to
their own file (`profile.js`, `contract.js` and `job.js`).

# Improvements to do in the future

Several improvements can be added in order to create a better API and a more robust application:
 - Validate the parameters in the controllers properly. We could use `joy` dependency.
 - `getProfile.js` middleware should return and profileId instead of the Profile object. Someone
  could change the profile object and updated out of the use cases and domain
 - Split `models.js` in different files: `profile.js`, `contract.js` and `job.js`. I tried a little bit but I thought that it was going to take a while to achieve it so I discarded it.
 - Separate domain logic from how data is saved in DB and ORM (Sequelize). I think this is out
 of the scope of the exercise, but domains are very coupled to infrastructure (Sequelize).
 - Deal better with the domain errors.

- I'm pretty sure that there are better ways of using `Sequelize` than I did 😅.
- Add Docker/DockerCompose to the solution

#  Run acceptance tests

First, start the API with `npm start` and then run `npm run acceptance`.
