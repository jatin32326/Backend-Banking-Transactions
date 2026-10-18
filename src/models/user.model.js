const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true,
        trim:true,
        lowercase:true,
        unique:[true,"Email already exist"]
    },
    name:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
        minlength:[6,"password should contain more than 6 character"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false,
    }
},{timestamps:true})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash

    
})

userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password,this.password)

}

const userModel = mongoose.model("user",userSchema);

module.exports = userModel