function _1(md){return(
md`# HW2 Strong baseline`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _yCounts(){return(
[]
)}

function _Constellation(data){return(
data.map(item => item.Constellation)
)}

function _5(yCounts,Constellation,data)
{
  yCounts.length = 0; //將yCounts清空
  var minCon = Math.min(...Constellation); 
  var maxCon = Math.max(...Constellation); 
  
  for (var y = minCon; y <= maxCon; y++) { 
    yCounts.push({Constellation: y, gender: "male", count: 0}); 
    yCounts.push({Constellation: y, gender: "female", count: 0}); 
  }
  
  data.forEach(x => {
    var i = (x.Constellation - minCon) * 2 + (x.Gender == "男" ? 0 : 1); 
    yCounts[i].count++;
  });

  return yCounts;
}


function _constellationMapping(){return(
[
  "牡羊座", "金牛座", "雙子座", "巨蟹座", 
  "獅子座", "處女座", "天秤座", "天蠍座", 
  "射手座", "摩羯座", "水瓶座", "雙魚座"
]
)}

function _7(Plot,constellationMapping,yCounts){return(
Plot.plot({
  grid: true,
  x: {
    label: "Constellation",
    tickFormat: (d) => constellationMapping[d], 
  },
  marks: [
    Plot.ruleY([0]),
    Plot.barY(yCounts, { 
      x: "Constellation", 
      y: "count", 
      tip: (d) => {
        return `count: ${d.count}, constellation: ${constellationMapping[d.Constellation]}, gender: ${d.gender}, `;
      },
      fill: "gender"
    }),
  ]
})
)}

function _8(Plot,constellationMapping,data){return(
Plot.plot({  
  width:800,
	y: {grid: true, label: "count"},  
  x: {
    label: "Constellation",
    tickFormat: (d) => constellationMapping[d], 
  },
	marks: [    
		Plot.rectY(data, Plot.binX({y:"count"}, { x:"Constellation", interval:1, fill:"Gender", tip: true })),    
	 ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.json", {url: new URL("../data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("yCounts")).define("yCounts", _yCounts);
  main.variable(observer("Constellation")).define("Constellation", ["data"], _Constellation);
  main.variable(observer()).define(["yCounts","Constellation","data"], _5);
  main.variable(observer("constellationMapping")).define("constellationMapping", _constellationMapping);
  main.variable(observer()).define(["Plot","constellationMapping","yCounts"], _7);
  main.variable(observer()).define(["Plot","constellationMapping","data"], _8);
  return main;
}
