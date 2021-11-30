//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");// so that while searching new route eg /home or /Home shows same page

const app = express();

app.set('view engine', 'ejs');// to use ejs

app.use(bodyParser.urlencoded({extended: true}));// for post request
app.use(express.static("public")); // to use css that is in public folder
mongoose.connect("mongodb+srv://admin-vinay:shivbaba@cluster0.skn37.mongodb.net/todolistDB",{useNewUrlParser: true});//connecting mongodb

const itemsSchema={  // creating schema
  name : String
};
const Item =mongoose.model("Item",itemsSchema);// creating model or collection
const item1 =new Item({
  name: "welcome to todolist"
});
const item2=new Item({
  name:"Hit thr + button to add a new item"
});
const item3 =new Item({
  name:"<-- Hit this to delete a item"
});
const defaultItems= [item1 ,item2 ,item3];
const listschema ={
  name: String,
  items:[itemsSchema]
};
const List =mongoose.model("List" , listschema);
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});


app.get("/", function(req, res) {
Item.find({},function(err,results){
    if(!err){                          // if results array that is document inside Item collection is empty so put default array
      if(results.length==0){
      Item.insertMany(defaultItems,function(err){
        if(!err){
        console.log("inserted successfully");}
      });
          res.redirect("/");
    }
   
      else{  // else just render 
        res.render("list", {listTitle: "today", newListItems: results});
      }
    
    }
  });



});
app.post("/delete" ,function(req,res){ // if we click on checkbox that item should be deleted
  const checkeditemId=req.body.checkbox; //input that which checkbox is checked acc to id we store that item
  const listName= req.body.listName; // from which list sice there are differnt list for all pages
  if(listName==="today"){ //if its  root route
    Item.findByIdAndRemove(checkeditemId,function(err){ // way to remove that element on basis of id
      if(!err){
        res.redirect("/");
      }
    });
  }
  else{         //else finding and making change in that particular list
       List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemId}}},function(err,foundlist) {
 if(!err){
   res.redirect("/" + listName); //redirect to that page only
 }

       
  
});
  }
});
app.get("/:customListName",function(req,res){ // to create dynamic pages, so that if we serach /work it creates that page with default items if alread present page then shows that page
  const customListName= _.capitalize(req.params.customListName);//lodash
 
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({ // creating new list for that new page with default items
          name: customListName,
          items : defaultItems
           });
     list.save();
     res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items}); //else showing that page with its items
      }
    }
  });
  
});

app.post("/", function(req, res){  

  const itemName = req.body.newItem; 
  const listName =req.body.list;
  const neitem =new Item({
    name:itemName
  });
  if(listName==="today"){
    neitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(neitem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
