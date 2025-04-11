
console.log("in start server before importing app")
const app = require('../app')
console.log("in start server")
// const startCronJob = require('../Utils/CronJob')
// const socketapi = require('../Utils/Sockets')


const startServer = () => {
    const server = app.listen(process.env.PORT, ()=>{
        if (process.env.NODE_ENV === "development") {
            console.log(
              `Server is running in Development mode on Port : ${process.env.PORT}`
            );
          } else if (process.env.NODE_ENV === "production") {
            console.log(
              `Server is running in Production mode on Port : ${process.env.PORT}`
            );
          }
    })


    // socketapi.io.attach(server, {
    //   cors: {
    //     origin: "*"
    //   }
    // })
    
    return server
}

//startCronJob()



module.exports = startServer