const addproduct=(btn) =>{
	console.log(btn.value);


fetch('/userlike/'+btn.value,{
	method:'get'
})
 .then(result=>{
	console.log(result);
})
 .catch(err=>{
	console.log(err);
});

};