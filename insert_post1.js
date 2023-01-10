const app = require('express')();
const cors = require('cors');
const bodyParser = require("body-parser")
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.urlencoded({
    extended:true
}));
const http = require('http').Server(app);
const io = require('socket.io')(http,{cors:{origin:'*'}});
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
// var url = "mongodb://127.0.0.1:27017/mydb";
var url = "mongodb+srv://rochanhive:fpFs8LAgf3eo3iYN@cluster0.5pllm4s.mongodb.net/?retryWrites=true&w=majority";
const port = 3213;
 

app.get('/del/',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").deleteMany({});
    res.send("Done");
  });
});
 

// Discover More Fetch Start
app.get('/post/discover_more/:id/',  (req, res) => {
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").find({"_id":new ObjectId(req.params.id)}).sort({time:-1}).toArray((err,ress)=>{
      if(err){
          throw err;
      }else{
          let okp=[];
          okp.push({data:ress})
          okp.push({status:"true"})
          res.send(okp)
      }
    });
  });
});
// Discover More Fetch End

//Subscribe To Channel Start
app.get('/channel/subscribe/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("channel").findOneAndUpdate({"channel":req.params.id,subs:{$nin:[req.params.uid]}}, {$addToSet:{subs:req.params.uid}}, { returnDocument:'after',new: true,projection: {subs:1} }, function(err, reso) {
        if (err) throw err;
        res.send(reso);
        
    });       
  });
});
//Subscribe To Channel End

//Unsubscribe To Channel Start
app.get('/channel/unsubscribe/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb"); 
       console.log(req.params.id)
       console.log(req.params.uid)
    dbo.collection("channel").findOneAndUpdate({"channel":req.params.id,subs:{$in:[req.params.uid]}}, {$pull:{subs:req.params.uid}},{  returnDocument:'after',new: true,projection: {subs:1} }, function(err, reso) {
        if (err) throw err;
        res.send(reso);
    });
  });
});
//Unsubscribe To Channel End

//Append Channel Start
app.get('/channel/append_ch/:id',  (req, resu) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    let j={
        channel:req.params.id,
        subs:[]
    };
    dbo.collection("channel").insertOne(j,(err,res)=>{
        if(err){
            throw err;
        }else{
            resu.send(JSON.stringify({status:true}));
            db.close();
        }
    });
  });
});
//Append To Channel End

// Comment Post Start
app.get('/post/cmnt_post/:id/:uid/:uimg/:mes/:name/:type/',  (req, res) => {
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").updateOne({"_id":new ObjectId(req.params.id)}, {$addToSet:{comnt:{_id:new ObjectId(),uid:req.params.uid,uimg:req.params.uimg,date:Date.now(),name:req.params.name,type:req.params.type,cmt:req.params.mes}}}, function(err, res) {
        if (err) throw err;
    });
  });
    res.send("0");
});
// Comment Post End
 
// Comment Fetch Start
app.get('/post/cmnt_post_fetch/:id/',  (req, res) => {
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").find({"_id":new ObjectId(req.params.id)},{ projection: {  like: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0 }}).sort({time:-1}).toArray((err,ress)=>{
      if(err){
          throw err;
      }else{
          let okp=[];
          okp.push({data:ress})
          okp.push({status:"true"})
          res.send(okp)
      }
    });
  });
});
// Comment Fetch End

// Like Post Start
app.get('/post/like/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),userId:{$nin:[req.params.uid]}}, {$inc: { like: 1 },$addToSet:{userId:req.params.uid}}, { returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err){
            throw err;            
        }else{
            res.send(reso);            
        }
    });
  });
});
// Like Post End

// Dislike Post Start
app.get('/post/dislike/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),userId:{$in:[req.params.uid]}}, {$inc: { like: -1 },$pull:{userId:req.params.uid}},{  returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err) throw err;
        res.send(reso);
        io.emit('message', {id:new ObjectId(req.params.id),ac:0,lstL:reso.value.like});
        console.log("Disliked");
    });
  });
});
// Dislike Post End

// Save Post Start
app.get('/post/save/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),saved:{$nin:[req.params.uid]}}, {$addToSet:{saved:req.params.uid}}, { returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err){
            throw err;            
        }else{
            res.send(reso);
        }
    });
  });
});
// Save Post End

// Unsave Post Start
app.get('/post/unsave/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),saved:{$in:[req.params.uid]}}, {$pull:{saved:req.params.uid}},{  returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err) throw err;
        res.send("0");
    });
  });
}); 
// Unsave Post End
 
// Report Post Start
app.get('/post/report/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),report:{$nin:[req.params.uid]}}, {$addToSet:{report:req.params.uid}}, { returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err){
            throw err;            
        }else{
            res.send(reso);
        }
    });
  });
});
// Report Post End

// Unreport Post Start
app.get('/post/unreport/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),report:{$in:[req.params.uid]}}, {$pull:{report:req.params.uid}},{  returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err) throw err;
        res.send("0");
    });
  });
}); 
// Unreport Post End

// Hide Post Start
app.get('/post/hide/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),hide:{$nin:[req.params.uid]}}, {$addToSet:{hide:req.params.uid}}, { returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err){
            throw err;            
        }else{
            res.send(reso);
        }
    });
  });
});
// Hide Post End

// Unhide Post Start
app.get('/post/unhide/:id/:uid',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    dbo.collection("posts").findOneAndUpdate({"_id":new ObjectId(req.params.id),hide:{$in:[req.params.uid]}}, {$pull:{hide:req.params.uid}},{  returnDocument:'after',new: true,projection: { comnt: 0,_id: 0,cate: 0,sub_cate: 0,content: 0,media: 0,country:0,city:0,title:0,userId:0,time:0} }, function(err, reso) {
        if (err) throw err;
        res.send("0");
    });
  });
}); 
// Unhide Post End

// Fetch All Data
app.get('/fetch/:id',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");

    dbo.collection('channel').find({subs:{$in:[req.params.id]}},{ projection: { _id: 0,subs:0 }}).toArray((err,ress)=>{
      if(err){
          throw err;
      }else{
          let ju7=[];
          for(let h=0;h<ress.length;h++){              
              ju7.push(ress[0].channel);
          }
          dbo.collection("posts").aggregate([
              {$project:{comnt:0}},
              {
                  '$lookup':{
                      from:'channel',
                      let: { brr: { $toString: "$brid" } },
                      pipeline: [
                          {
                              $match:
                              {
                                  $expr:{ $eq: ["$$brr", "$channel"]}
                              }
                          },
                          {
                              $project:{_id:0, subs:1}
                          }
                      ],
                      localField:'channel',
                      foreignField:'brid',
                      as:'data'
                  },            
              },
              {
                  $match:{
                      brid:{$in:ju7}
                  }
              }
          ]).toArray((err,resso)=>{
              if(err){
                  throw err;
              }else{
                  let okp=[];
                  okp.push({data:resso});
                  okp.push({status:"true"});          
                  res.send(okp)
              }
          });
      }
    });
       
       
  });
});
app.get('/fetch/',  (req, res) => {
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");

      dbo.collection("posts").aggregate([
          {$project:{comnt:0}},
          {
              '$lookup':{
                  from:'channel',
                  let: { brr: { $toString: "$brid" } },
                  pipeline: [
                      {
                          $match:
                          {
                              $expr:{ $eq: ["$$brr", "$channel"]}
                          }
                      },
                      {
                          $project:{_id:0, subs:1}
                      }
                  ],
                  localField:'channel',
                  foreignField:'brid',
                  as:'data'
              },            
          }
      ]).toArray((err,resso)=>{
          if(err){
              throw err;
          }else{
              let okp=[];
              okp.push({data:resso});
              okp.push({status:"true"});          
              res.send(okp)
          }
      });
  });
});
app.get('/fetch/dis/:id/:id2',  (req, res) => {
    console.log(req.params.id2);
    let i=0,i2=0;
    if(req.params.id!=0){
        i=req.params.id;
    }
    if(req.params.id2!=0){
        i2=req.params.id2;
    }
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");

      dbo.collection("posts").aggregate([
          {$project:{comnt:0}},
          {
              '$lookup':{
                  from:'channel',
                  let: { brr: { $toString: "$brid" } },
                  pipeline: [
                      {
                          $match:
                          {
                              $expr:{ $eq: ["$$brr", "$channel"]}
                          }
                      },
                      {
                          $project:{_id:0, subs:1}
                      }
                  ],
                  localField:'channel',
                  foreignField:'brid',
                  as:'data'
              },            
          },{
            $match:{
              cate:i,
              sub_cate:i2
            }
          }
      ]).toArray((err,resso)=>{
          console.log(resso);
          if(err){
              throw err;
          }else{
              let okp=[];
              okp.push({data:resso});
              okp.push({status:"true"});          
              res.send(okp)
          }
      });
  });
});
app.get('/fetch/dis/:id',  (req, res) => {
    console.log(req.params.id);
    let i=0;
    if(req.params.id!=0){
        i=req.params.id;
    }
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");

      dbo.collection("posts").aggregate([
          {$project:{comnt:0}},
          {
              '$lookup':{
                  from:'channel',
                  let: { brr: { $toString: "$brid" } },
                  pipeline: [
                      {
                          $match:
                          {
                              $expr:{ $eq: ["$$brr", "$channel"]}
                          }
                      },
                      {
                          $project:{_id:0, subs:1}
                      }
                  ],
                  localField:'channel',
                  foreignField:'brid',
                  as:'data'
              },            
          },{
            $match:{
              cate:i
            }
          }
      ]).toArray((err,resso)=>{
          if(err){
              throw err;
          }else{
              let okp=[];
              okp.push({data:resso});
              okp.push({status:"true"});          
              res.send(okp)
          }
      });
  });
});

// Fetch All Data
 
// Insert Post Start
app.post('/post/insert/', (req, resu) => {
    console.log("LOG : "+req.body.title);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    let j={
            cate:req.body.cate,
            country:req.body.sub_cate,
            city:req.body.city,
            title:req.body.title,
            sub_cate:req.body.sub_cate,
            content:req.body.content,
            media:JSON.parse('['+req.body.media+']'),
            time:req.body.time,
            brid:req.body.id,
            userId:[],
            like:0,
    };
    dbo.collection("posts").insertOne(j,(err,res)=>{
        if(err){
            throw err;
        }else{
            let ji1={
                post_id:res.insertedId,
                likes:[]
            }
            dbo.collection("likes").insertOne(ji1,(err,resh)=>{
                if(err){
                    throw err;
                }else{
                    console.log(res)
                    resu.send(JSON.stringify({status:true}));
                }
                db.close();
            });
        }
    });
  });
});
// Insert Post End

/*
// Fetch Post Start
app.get('/post/fetch/:fil1/:fil2/:ty/:sk/:lm', (req, res) => {
  console.log(req.headers.host)
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    let j0=req.params.fil1;
    let j1=req.params.fil2;
    let j2;
    if(req.params.ty==1){
      j2=JSON.parse('{"'+j0+'":"'+j1+'"}');
    }else{
      j2=JSON.parse('{"'+j0+'":'+j1+'}');      
    }
    dbo.collection("posts").find(j2,{ projection: { comnt: 0 } }).skip(parseInt(req.params.sk)).limit(parseInt(req.params.lm)).sort({time:-1}).toArray((err,ress)=>{
      if(err){
        throw err;
      }else{
        res.send(ress)
      }
    });
  });  
});
// Fetch Post End

// Update Like Start
app.get('/post/like/:id/:uid/', (req, res) => {
  console.log(req.headers.host)
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      let dbo = db.db("mydb");
      let j2=parseInt(req.params.id);
      let j3=parseInt(req.params.uid);
      let j4=JSON.parse('{"id":'+j2+'}');      
      dbo.collection("posts").updateOne(j4,{ $inc: { like: 1 }});
      res.send("Done");
  });
});
// Update Like End

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Connect to MongoDb Client Start
io.on('connection', (socket) => {        
  socket.on('chat message', msg => {
      io.emit('chat message', msg);
    });
  });

*/
// Connect to MongoDb Client End
io.on('connection', (socket) => {        
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
