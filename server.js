const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const app = express() 
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLScalarType
  } = require('graphql')


const users = [
	{ id: 1, name: 'Bala', email:"bala@gmail.com",weeklyGoal:1000 },
	{ id: 2, name: 'Meena' , email:"meena@gmail.com",weeklyGoal:800 },
	{ id: 3, name: 'Santhi', email:"Santhi@gmail.com",weeklyGoal:1200 },
    { id: 4, name: 'Aman', email:"Aman@gmail.com",weeklyGoal:700 }
]

const workouts = [
	{ id: 1, name: 'Push Ups', calBurn: 20,sets:3,reps:15 },
	{ id: 2, name: 'Pull Ups', calBurn: 30,sets:2,reps:10 },
	{ id: 3, name: 'Crunches', calBurn: 40,sets:3,reps:15 },
	{ id: 4, name: 'Dumbell lift', calBurn: 50,sets:3,reps:15 },
	{ id: 5, name: 'Deadlift', calBurn: 45,sets:2,reps:10 },
	{ id: 6, name: 'Streches', calBurn: 10,sets:5,reps:10 },
	{ id: 7, name: 'Treadmill', calBurn: 50,sets:1,reps:20 },
	{ id: 8, name: 'Barbell lift', calBurn: 35,sets:2,reps:10 }
]

const programs = [
    {id:1, name:"Full Body",workouts:[1,2,3,6,7],cal:150},
  {id:2, name:"Chest",workouts:[4,5,3,6,8],cal:180},
  {id:3, name:"Shoulder and Arms",workouts:[1,2,3,5,8],cal:180},
  {id:4, name:"Cardio",workouts:[3,6,7],cal:100}
]

const tracker = [
    {id:1,userid:1,programId:1,date:'15/01/2023'},
    {id:2,userid:2,programId:2,date:'16/01/2023'},
    {id:3,userid:3,programId:1,date:'16/01/2023'},
    {id:4,userid:4,programId:3,date:'15/01/2023'},
    {id:5,userid:1,programId:2,date:'16/01/2023'}
]

const tracking = new GraphQLObjectType({
  name: 'Tracker',
  description: 'This represents a exercises done on date', 
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    users: {
        type: new GraphQLList(userDets),
        resolve: (tracker) => {
        return users.filter(users => users.id === tracker.userid)
      }
    },
    programs:{
        type: new GraphQLList(ProgramDet),
        resolve: (tracker)=>{
            return programs.filter(programs => programs.id == tracker.programId)
        }
    },
    date:{ type: GraphQLNonNull(GraphQLString) },
  })
})
const userDets = new GraphQLObjectType({
    name: 'Users',
    description: 'This represents a users present in the app',
    fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    tracker: {
        type: new GraphQLList(tracking),
        resolve: (users)=>{
            return tracker.filter(tracker => tracker.userid == users.id)
        }
    },
    weeklyGoal:{
        type: GraphQLNonNull(GraphQLInt)
    },
    totalCalories:{
        type:GraphQLNonNull(GraphQLInt),
        resolve: (users)=>{
            return getUserTotalCal(users.id)
        }
    }
    })
})
const ProgramDet = new GraphQLObjectType({
    name: 'Programs',
    description: 'This represents a Programs and its workout details',
    fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) }, 
    cal: {type: GraphQLNonNull(GraphQLInt)},
    workouts: {
        type: new GraphQLList(workoutDet),
        resolve: (programs)=>{
            return getWorkoutDetailsByProgramId(programs.id)
        }
    },
    })
})
const workoutDet = new GraphQLObjectType({
    name: 'workouts',
    description: 'This represents a workout sets,reps and calories burnt',
    fields: () => ({
    id: {type: GraphQLNonNull(GraphQLInt) },
    name: {type: GraphQLNonNull(GraphQLString) }, 
    calBurn: {type: GraphQLNonNull(GraphQLInt)},
    sets: {type: GraphQLNonNull(GraphQLInt)},
    reps: {type: GraphQLNonNull(GraphQLInt)}
    })
})
function getWorkoutDetailsByProgramId(programId) {
    const program = programs.find(p => p.id === programId);
    if (!program) {
      return null;
    }
   const workoutIds = Object.values(program.workouts).flat();
    const workoutDetails = workoutIds.map(wid => {
      const workout = workouts.find(w => w.id === wid);
      return { wid, ...workout };
    });
  
    return workoutDetails;
  }
  function getUserTotalCal(userId) {
    let totalCal = 0;
    tracker.forEach((item) => {
      if (item.userid === userId) {
        const program = programs.find((p) => p.id === item.programId);
        totalCal += program.cal;
      }
    });
    return totalCal;
  }
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    track: {
        type: tracking,
        description: 'A Single record from tracker',
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (parent, args) => tracker.find(track => track.id === args.id)
      },
      tracker: {
        type: new GraphQLList(tracking),
        description: 'This represents a exercises done on date',
        resolve: () => tracker
      },
      users:{
        type: new GraphQLList(userDets),
        description: 'Details of users',
        resolve: () => users
      },
      user: {
        type: userDets,
        description: 'A Single user',
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (parent, args) => users.find(user => user.id === args.id)
      },
      programs:{
        type: new GraphQLList(ProgramDet),
        description: 'Programs details',
        resolve: () => programs
      },
      program:{
        type: ProgramDet,
        description: 'Details of a program',
        args: {
            id: { type: GraphQLInt }
          },
          resolve: (parent, args) => programs.find(programs => programs.id === args.id)
      }
  })
})
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
  addUser: {
    type: userDets,
    description: "Add user to the list",
    args:{
      name: { type: GraphQLNonNull(GraphQLString) },
      email :{ type: GraphQLNonNull(GraphQLString) },
      weeklyGoal: {type: GraphQLNonNull(GraphQLInt)}
    },
    resolve: (parent, args) => {
      const user = {id: users.length +1,name: args.name,email: args.email, weeklyGoal:args.weeklyGoal}
      users.push(user)
      return user
    }
  },
  trackProgress: {
    type: tracking,
    description: "Add programs to the tracker",
    args:{
      userId: { type: GraphQLNonNull(GraphQLInt) },
      ProgramId: { type: GraphQLNonNull(GraphQLInt) },
      date: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve: (parent, args) => {
    return createTracker(args.userId, args.ProgramId, args.date)
    }
  },
  updateGoal: {
    type: userDets,
    description: "Update Weekly Goal for a single user",
    args:{
      id: { type: GraphQLNonNull(GraphQLInt) },
      weeklyGoal: { type: GraphQLNonNull(GraphQLInt) }
    },
    resolve: (parent, args) => {
      const userIndex = users.findIndex(user => user.id === args.id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${args.id} not found`);
    }
    users[userIndex].weeklyGoal = args.weeklyGoal;
    return users[userIndex];
    }
  }
})
})
const EmailAddress = new GraphQLScalarType({
  name: 'EmailAddress',
  serialize: value => value,
  parseValue: value => value.replace(/\./g, '\\.'),
  parseLiteral: ast => ast.value.replace(/\./g, '\\.'),
});

const schema1 = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
  })
  app.use('/graphql', expressGraphQL({
    schema: schema1,
    graphiql: true
  }))
  app.listen(5050, () => console.log('Server Running'))
  function createTracker(userId, programId, date) {
    const user1 = users.find(user => user.id === userId);
    const program = programs.find(program => program.id === programId);
  
    if (!user1 || !program) {
      return { error: "User or program not found" };
    }
    const newTracker = {
      id: tracker.length + 1,
      userid: userId,
      programId: programId,
      date: date
    };
 
    tracker.push(newTracker);
    return newTracker;
  }