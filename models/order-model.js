const mongoose=require('mongoose');
const Schema=mongoose.Schema;

let OrderSchema=new Schema({
    name:{type:String},
    email:{type:String},
    address:{type:String},
    product_name:{type:String},
    quantity:{type:String},
    unit_price:{type:String},
    order_date:{type:String}   
});

module.exports=mongoose.model('orderlist',OrderSchema,'orderlist');