// This function is for update Mongo Schema

const mongoose = require ("mongoose")
const User = require("./modal/user")
require("dotenv").config()
async function reUpdate(){
   try{
    await mongoose.connect(process.env.MONGO_DB_URI)
    const update  = await User.updateMany(
        {active: {"$exists": false}},
        {Set: {"active": true}}
    )
    console.log("Users Update", update.modifiedCount)
    mongoose.disconnect()
   }catch(error){
    console.log("Error Updating User", error)
   }
}
reUpdate()