// 參考 D3 畫廊中由 shaunkallis 所提供的樣本 Stacked Horizontal Bar Chart of cumulative homework scores
// https://observablehq.com/@shaunkallis/stacked-horizontal-bar-chart-of-cumulative-homework-score
let parsed_csv;
let student_info = [];
let student_total_grade = Array(120).fill(0);
let series;
let color_dict;
let labelSpan = [10, 45, 100, 150, 210];
let margin = ({top: 5, right: 10, bottom: 0, left: 250});

d3.text("./csv/data.csv").then(function (data) {
    parsed_csv = d3.csvParse(data, (d, i, columns) => {
        d3.autoType(d);
        d.total = d3.sum(columns.slice(5), c => d[c]);
        student_info.push([
            d.序號,
            d.班級,
            d.學號,
            d.姓名,
            d['GitHub']
        ]);
        //console.log(d['GitHub']); // 添加這行
        return d;
    });

    series = d3.stack().keys(parsed_csv.columns.slice(5))(parsed_csv).map(d => (d.forEach(v => v.key = d.key), d))

    color_dict = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeSpectral[series.length] || ["#ccc"]);
    
    CreateHintSVG();
    CreateScoreSVG();
});

//***************************************************
function DomainConvert(student) {
    return student.序號;
}

function CreateHintSVG() {
    const rect_height = 20
    const rect_width = 64
    const score_header = parsed_csv.columns.slice(5);
    var width = 900;
    var height = rect_height;
    
    // 創建作業顏色對照表的svg
    var hint_svg = d3.create("svg")
        .attr("viewBox", [0, -margin.top, width, height + margin.top])
    hint_svg.append("g")
        .attr("transform", "translate(0,15)")
        .attr("opacity", 1)
        .append("text")
        .selectAll("tspan")
        .data(parsed_csv.columns.slice(0, 5)).enter()
        .append("tspan")
        .attr("x", (d, i) => {
            return labelSpan[i];
        })
        .attr("font-size", "8pt")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(d => d);

    // 繪製固定長度的多色矩形
    hint_svg.append("g")
        .attr("id", "score-hint")
        .selectAll("rect")
        .data(score_header)
        .join("rect")
        .attr("fill", d => color_dict(d))
        .attr("x", (d, i) => i * rect_width + margin.left)
        .attr("y", 0)
        .attr("width", rect_width)
        .attr("height", rect_height)
    
    // 於多色矩形之上添加"作業X"文字
    hint_svg.select("#score-hint")
        .selectAll("text")
        .data(score_header)
        .join("text")
        .attr("class", "rect-text")
        .attr("x", (d, i) => (i) * rect_width + margin.left + 31)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", 10)
        .text(d => d);
        
    d3.select("#div1")        
        .style("font-size", "28pt")
        .style("width", "90%")
        .style("margin", "5px auto")
        .style("text-align", "center")
        .node()
        .appendChild(hint_svg.node());
}

function CreateScoreSVG() {
    var width = 900;
    var height = parsed_csv.length * 25 + margin.top + margin.bottom;

    var formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");
    
    var y = d3.scaleBand()
        .domain(parsed_csv.map(d => {
            return DomainConvert(d);
        }))
        .range([margin.top, height - margin.bottom])
        .padding(0.08);

    var x = d3.scaleLinear()
        //.domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .domain([0, 100])
        .range([margin.left, width - margin.right]);

    var score_svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    score_svg.append("g")
        .attr("id", "chart")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color_dict(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", (d, i) => y(DomainConvert(d.data)))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .append("title")
        .text(d => `${d.data.姓名} ${d.key} 分數 ${formatValue(d.data[d.key])}`)

    // 添加 text 元素，確保它在 rect 之後
    score_svg.select("#chart")
        .selectAll("g")
        .data(series)
        .join("g")
        .selectAll("text")
        .data(d => d)
        .join("text")
        .attr("class", "rect-text")
        .attr("x", d => x(d[0]) + (x(d[1]) - x(d[0])) / 2)
        .attr("y", (d, i) => y(DomainConvert(d.data)) + 16)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text(function(d) {
            score = d[1] - d[0];
            student_total_grade[parseInt(d.data.序號, 10)] += score;
            //console.log(typeof d.data.序號)
            //console.log(`序號: ${d.data.序號}, 成績: ${student_total_grade[d.data.序號]}`)
            if (score != 0) {
                return score;
            }
            else {
                return "";
            }
        });
    
    d3.select("#div2")
        .style("width", "90%") 
        .style("margin", "5px auto") 
        .node()
        .appendChild(score_svg.node());
    
    function getColor(score) {
        // 根據成績區間返回對應的顏色
        if(score >= 95){
            return "#ffa500";  // 95以上 orange
        }
        else if(score >= 90){
            return "#ff0000";  // 90以上 red
        }
        else if (score >= 85) {
            return "#800080";  // 85以上 purple
        } else if (score >= 75) {
            return "#0000cd";    // 75以上 lightblue
        } else if (score >= 65) {
            return "#add8e6";   // 65以上 lightblue 
        } else if (score >= 60) {
            return "#ffd700";    // 60以上 gold
        } else if (score >= 40) {
            return "#c0c0c0";  // 40以上 silver
        } else if (score >= 20) {
            return "#cd7f32";  // 20以上 brown
        } else {
            return "#5a5a5a";    // 0~19 gray
        }
    }
    
let color;

d3.select("#div2")
    .select("svg")
    .append("g")
    .attr("transform", "translate(0,0)")
    .call(d3.axisRight(y).tickFormat(""))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("g").select("line").remove())
    .selectAll("g")
    .data(student_info)
    .selectAll("text")
    .data(d => [d])
    .attr("font-size", "8pt")
    .selectAll("tspan")
    .data(d => d)
    .enter()
    .append("tspan")
    .attr("x", (d, i) => labelSpan[i])
    .attr("text-anchor", "middle")
    .html((d, i) => {
        if(i == 0){
            color = getColor(student_total_grade[d]) 
        }
        if (i === 4) {
            console.log(color);
            return '<a xlink:href="https://github.com/' + d + '/vis2023f/" target="_blank" style="fill: ' + color + '; text-decoration: underline;">' + d + '</a>';
        } else {
            return d;
        }
    });

}