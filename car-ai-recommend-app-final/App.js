import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";


export default function App(){

const [budget,setBudget] = useState("");
const [purpose,setPurpose] = useState("");
const [favorite,setFavorite] = useState("");

const [result,setResult] = useState([]);



const cars = [

{
name:"현대 아반떼",
price:2000,
type:"세단",
purpose:"출퇴근",
reason:"경제적인 유지비와 실용성"
},

{
name:"기아 K3",
price:2200,
type:"세단",
purpose:"출퇴근",
reason:"합리적인 가격과 편안한 주행"
},

{
name:"현대 베뉴",
price:2300,
type:"SUV",
purpose:"출퇴근",
reason:"작지만 활용성 높은 SUV"
},

{
name:"기아 셀토스",
price:2800,
type:"SUV",
purpose:"여행",
reason:"공간성과 실용성"
},

{
name:"현대 투싼",
price:3500,
type:"SUV",
purpose:"가족",
reason:"넓은 공간과 안전성"
},

{
name:"기아 쏘렌토",
price:4500,
type:"SUV",
purpose:"가족",
reason:"패밀리 SUV"
},

{
name:"현대 그랜저",
price:4500,
type:"세단",
purpose:"출퇴근",
reason:"고급스러운 승차감"
},

{
name:"제네시스 G80",
price:6000,
type:"세단",
purpose:"비즈니스",
reason:"프리미엄 세단"
},

{
name:"벤츠 S클래스",
price:15000,
type:"세단",
purpose:"비즈니스",
reason:"최상급 럭셔리 세단"
},

{
name:"BMW X7",
price:14000,
type:"SUV",
purpose:"가족",
reason:"프리미엄 대형 SUV"
},

{
name:"현대 아이오닉5",
price:5000,
type:"전기차",
purpose:"친환경",
reason:"전기차 기술과 효율성"
},

{
name:"기아 EV6",
price:5500,
type:"전기차",
purpose:"친환경",
reason:"스포티한 전기차"
}

];



function recommend(){


let budgetNumber =
parseInt(
budget.replace(/[^0-9]/g,"")
) || 3000;



let scored = cars.map(car=>{


let score=0;


// 예산 가까울수록 점수 증가

let gap=Math.abs(car.price-budgetNumber);

if(gap < 1000){
score += 40;
}
else if(gap < 3000){
score += 20;
}



// 선호 차량

if(
favorite.includes(car.type)
){
score += 35;
}


// 용도

if(
purpose.includes(car.purpose)
){
score += 25;
}



return {
...car,
score
};


});



let top3 =
scored
.sort((a,b)=>b.score-a.score)
.slice(0,3);



setResult(top3);

}



return (

<ScrollView style={styles.container}>


<Text style={styles.title}>
🚗 AI 자동차 추천
</Text>


<Text style={styles.info}>
예산과 목적, 선호 차량을 분석하여
TOP 3 차량을 추천합니다.
</Text>



<TextInput
style={styles.input}
placeholder="예산 (예: 3000만원)"
value={budget}
onChangeText={setBudget}
/>


<TextInput
style={styles.input}
placeholder="차량 용도 (예: 출퇴근, 가족)"
value={purpose}
onChangeText={setPurpose}
/>


<TextInput
style={styles.input}
placeholder="선호 차량 (예: SUV, 세단, 전기차)"
value={favorite}
onChangeText={setFavorite}
/>



<Pressable
style={styles.button}
onPress={recommend}
>

<Text style={styles.buttonText}>
AI 추천 받기
</Text>

</Pressable>



{
result.map((car,index)=>(

<View style={styles.card} key={car.name}>

<Text style={styles.rank}>
🏆 {index+1}위
</Text>


<Text style={styles.car}>
{car.name}
</Text>


<Text>
추천 점수 : {car.score}점
</Text>


<Text>
추천 이유 : {car.reason}
</Text>


</View>

))
}



</ScrollView>

);

}



const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7fb",
padding:25
},

title:{
fontSize:30,
fontWeight:"bold",
textAlign:"center",
marginTop:40
},

info:{
textAlign:"center",
margin:20
},


input:{
backgroundColor:"white",
padding:15,
marginVertical:8,
borderRadius:10,
fontSize:16
},


button:{
backgroundColor:"#2563eb",
padding:16,
borderRadius:12,
marginTop:15
},


buttonText:{
color:"white",
textAlign:"center",
fontSize:18,
fontWeight:"bold"
},


card:{
backgroundColor:"white",
padding:20,
marginTop:20,
borderRadius:15
},

rank:{
fontSize:18,
fontWeight:"bold"
},

car:{
fontSize:22,
fontWeight:"bold",
marginVertical:10
}


});