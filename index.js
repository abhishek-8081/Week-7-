const express = require("express");
const bcrypt = require("bcrypt");
const {UserModel,TodoModel}= require("./db");
const jwt = require("jsonwebtoken");
const {default: mongoose } = require("mongoose");
const JWT_SECRET="asddfff";
const app = express();
const {z}= require("zod");

mongoose.connect("");

app.use(express.json());
app.post("/signup",async function(req,res){
    const requiredBody=z.object({
        email:z.string().min(3).max(100).email(),
        password:z.string().min(3).max(30),
        name:z.string().min(3).max(30)
    })
    
    // const parsedData = requiredBody.parse(req.body);
    const parsedDataWithSucess=requiredBody.safeParse(req.body);

    if(!parsedDataWithSucess.success){
        res.json({
            message:"Incorrect Format",
            error:parsedDataWithSucess.error
        })
        return 
    }


    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;


    if(typeof email !=="string" || email.length<5 || !email.includes("@")){
        res.json({
            message:"Email Incorrect"
        })
        return 
    }

   


    const hashedPasssword = await bcrypt.hash(password,5);
    console.log(hashedPasssword);

       await UserModel.create({
        email:email,
        password:hashedPasssword,
        name:name
       
    });
    
       
   
        res.json({
            message:"You are logged in"
        })
    

   
    
}); 

app.post("/signin",async function(req,res){
    const email= req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email:email
    });

    if(!response){
        res.status(403).json({
            message:"User does not exist in  our DB"
        })
        return 
    }

    const passwordMatch=await bcrypt.compare(password,response.password);



    if(passwordMatch){
        const token = jwt.sign({
            id: response._id .toString()

        },JWT_SECRET);
        res.json({
            token:token

        })

    }
    else{
        res.status(403).json({
            message:"Incorrect Credentials"
        })
    }
    

});

app.post("/todo",auth,function(req,res){
    const userId = req.userId;
    res.json({
        userId:userId
    })
    
});
app.post("/todos",auth,async function(req,res){
    const userId = req.userId;
    const todos = await TodoModel.find({
        userId:userId
    })
    res.json({
        todos
    })
    
});

function auth(req,res,next){
    const token = req.headers.token;

    const decodedData=jwt.verify(token,JWT_SECRET);
    if(decodedData){
        req.userId = decodedData.id;
        next();

    }
    else{
        res.status(403).json({
            message:"incorrct Credentials"
        })
    }


}

app.listen(3000);
