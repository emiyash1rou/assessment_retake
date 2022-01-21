const express= require('express');
const bodyParser= require('body-parser');
const mysql= require('mysql');
const path = require('path');
require('dotenv').config();
const app= express();
const port = process.env.PORT || 5000;
//body parser is a parsing middleware
//parsing middleware
//parse application/www.
app.use(bodyParser.urlencoded({extended:false}))
 
// Install cookieparser, express-session: To Create Session
var cookieParser= require('cookie-parser')
var session= require('express-session')
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!",saveUninitialized:true, resave: false}));
 
 
// Parse application.json
app.use(bodyParser.json());
 
// DATABASE CONNECTION YARN
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'love'
});
db.connect((err)=>{
    if (err) {
   console.log(err)
    }else{
        console.log("Connected to db")
    }
   
})
 
//access files static
app.use(express.static(path.join(__dirname, '/public')));
//Templating Engine
// app.engine('hbs', exphbs( {extname: '.hbs'}));
app.set('view engine','ejs');
app.get("/main",(req,res)=>{
    res.render("landing")
})
app.post("/update",(req,res)=>{
    const params=req.body;
    console.log("Form",params)
    const sql = `UPDATE love.applicationform SET vehiclecat="${params.vehiclecat}", conditions="${params.conditions}", mname="${params.mname}", mothername="${params.mothername}", spousename="${params.spousename}", emercontact="${params.emercontact}" ,typeofapplication="${params.typeofapplication}", fathername="${params.fathername}",drivingskillacquired="${params.drivingskillacquired}", highesteducational="${params.highesteducational}", bloodtype="${params.bloodtype}", organdonor="${params.organdonor}", eyecolor="${params.eyecolor}", civilstat="${params.civilstat}", licenseclass="${params.licenseclass}", weight="${params.weight}", paddress="${params.paddress}", nationality="${params.nationality}",sex="${params.sex}",birthdate="${params.birthdate}",height="${params.height}" WHERE userid = ${req.session.userid.id}`
    db.query(sql,(err,result)=>{
if (err) throw err
res.send(true);
    });
})
app.all("/signup",(req,res) =>{
    if (req.method=="POST"){
        var params=req.body;
        params.role="guest";
        console.log(params)
        const sql="INSERT INTO users SET ?";
        db.query(sql,params,(err,result)=>{
            if (err) throw err
 
        db.query("SELECT LAST_INSERT_ID() as id",(err1,result1)=>{
            if (err1) throw err1
            var session= req.session
            console.log(session)
            session.username = {name:params.username}
            session.userid = {id:result1[0].id}
            session.role = {role:params.role}
            console.log(params.username)
            res.locals.user=params.username
            res.redirect("/user_homepage");
 
        })
           
        })
 
    }else{
        res.render('signup',{error:false})
    }
})
app.all("/signin",(req,res)=>{
    //check post
    if(req.method=="POST"){
        const params=req.body
        const sql= `SELECT id,username,fname,lname,contactno,email,role FROM users WHERE username="${params.username}" and password= "${params.password}"`
        db.query(sql,(err,results)=>{
            if (err) throw err;
            console.log(results)
            if (results.length==0){
                res.render("signin",{error:true})
 
            }else{
                var session=req.session
               
                session.userid={id:results[0].id}
                session.role={role:results[0].role}
                session.username={name:results[0].username}
                session.fname={name:results[0].fname}
                session.lname={name:results[0].lname}
                session.contactno={contactno:results[0].contactno}
                session.email={email:results[0].email}
                console.log("Signed In"+session)
                if (session.role.role=="admin"){
                        res.redirect("/admin_homepage")
                }else{
                    res.redirect("/user_homepage")
                }
            }
        })
    }else{
        res.render("signin",{error:false})
    }
 
   
})
app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect('/');
 
})
app.all("/admin_homepage",(req,res)=>{
    if (req.session.userid!=null && req.session.role.role!="admin"){
res.redirect("/user_homepage")
    }
    if(req.method=="POST"){
            var params=req.body;
            var session=req.session;
            params.userid=req.session.userid.id;
            delete params['fname']
            delete params['lname']
            console.log("Delivered:"+params.userid)
            const sql="INSERT INTO love.applicationform SET ?";
            db.query(sql,params,(err,result)=>{
                if (err) throw err
                //start
                res.redirect("/admin_homepage");
               
            })
     
    
    }else{
        const sql1= `SELECT * FROM love.applicationform`
        console.log(sql1)
        var session=req.session
        console.log("Hahaha"+session.userid.id)
        db.query(sql1,(err1,results1)=>{
            if (err1) throw err1;
            console.log(results1)
            if (results1.length==0){
                res.render("admin_homepage",{operation:null,data:null,user_data:session});
 
            }else{
                res.render("admin_homepage",{operation:null,data:results1,user_data:session});
            }})
            

        
    
}
})
app.all("/user_homepage",(req,res)=>{
    if(req.method=="POST"){
            var params=req.body;
            var session=req.session;
            params.userid=req.session.userid.id;
            delete params['fname']
            delete params['lname']
            console.log("Delivered:"+params.userid)
            const sql="INSERT INTO love.applicationform SET ?";
            db.query(sql,params,(err,result)=>{
                if (err) throw err
                //start
                res.redirect("/user_homepage");
               
            })
     
    
    }else{
        const sql1= `SELECT * FROM love.applicationform WHERE userid=${req.session.userid.id}`
        console.log(sql1)
        var session=req.session
        console.log("Hahaha"+session.userid.id)
        db.query(sql1,(err1,results1)=>{
            if (err1) throw err1;
            console.log(results1)
            if (results1.length==0){
                res.render("user_homepage",{operation:null,data:null,user_data:session});
 
            }else{
                res.render("user_homepage",{operation:null,data:results1,user_data:session});
            }})
            

        
    
}
})
app.get("/",(req,res)=>{
    //deletable
    // var session=req.session
    // session.userid={id:44}
    // session.role={role:"guest"}
    // session.username={name:"mer"}
    // session.fname={fname:"merham"}
    // session.lname={lname:"umbukan"}
    // session.fname={lname:"umbukan"}
    // //end
    // console.log(req.session)
 
    if (req.session.userid!=null){
        res.redirect("/user_homepage")
    }else{
        res.redirect("/main")
       
    }
//res.locals only works when it is rendered
})
// Linker for the routes, basically what it
// does is that it readies file for use, and When
// /users is Ran, it wil redirect to the userRouter file
// which is the file required at the top. Basically
//just js extends file
 
app.listen(process.env.PORT || port, () => console.log(`Example app listening at http://localhost:${port}`));