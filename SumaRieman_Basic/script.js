// Se declaran variables globales
// Cada una de las siguientes variables extrae un elemento del formulario

// Se obtiene el form
const formulario = document.getElementById('riemann-form');

// Se obtiene el div donde se mostrara la suma total
const resultado = document.getElementById('result');

// Se obtiene el slider (la barrita que permite modificar el numero de rectangulos)
const slider = document.getElementById('rectangleSlider');

// Se obtiene el div donde se muestra el valor actual del slider
const sliderValor = document.getElementById('sliderValue');

// Se declaran variables para el gráfico
let svg, xScale, yScale, xAxis, yAxis, functionPath, rectGroup;

// Se declara la función y los límites para la suma
let funcion, limiteInferior, limiteSuperior, compiledFunction;

// Definición de márgenes y dimensiones del gráfico
const margin = {top: 20, right: 20, bottom: 50, left: 50};
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


// Función para crear el gráfico SVG
function CrearGrafico() {
    // Elimina el contenido existente del div #graph
    // esto para que no se acumulen gráficos en el div
    d3.select("#graph").selectAll("*").remove();
    
    // Se crea el elemento SVG con las dimensiones especificadas
    // d3  no se declara ya que proviene de la libreria importada en el index.html 
    svg = d3.select("#graph")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // Definimos las escalas X e Y
    xScale = d3.scaleLinear().range([0, width]);
    yScale = d3.scaleLinear().range([height, 0]);

    // Creamos los ejes X 
    xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis");

    // Creamos los ejes Y
    yAxis = svg.append("g")
        .attr("class", "y-axis");

    // Añadimos las líneas de los ejes
    svg.append("line")
        .attr("class", "x-axis-line")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("line")
        .attr("class", "y-axis-line")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // Creamos el path para la función
    // el path es el "Camino" que seguira la linea de la funcion
    functionPath = svg.append("path")
        .attr("class", "function-line")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2);

    // Creamos un grupo donde agregaremos los rectángulos
    rectGroup = svg.append("g").attr("class", "rect-group");
}


// Declaracion del evento submit para el formulario
// esto para que cada que se presione el boton "Calcular" se inicie todo el proceso
formulario.addEventListener('submit', function(e) {
    // Evitamos que la página se recargue
    e.preventDefault();
    // Obtenemos los valores del formulario
    funcion = document.getElementById('function').value;
    limiteInferior = parseFloat(document.getElementById('a').value);
    limiteSuperior = parseFloat(document.getElementById('b').value);
    slider.value = document.getElementById('n').value;
    updateSliderValue();
    CrearGrafico();
    CalcularYDibujarSuma();
});

// Declaracion del evento input para al momento de cambiar el valor del slider
// se actualize en automatico el grafico
slider.addEventListener('input', function() {
    updateSliderValue();
    CalcularYDibujarSuma();
});

// Función para actualizar el valor mostrado del slider
function updateSliderValue() {
    sliderValor.textContent = "Rectángulos: "+ slider.value;
}

// Función principal para calcular la suma de Riemann y dibujar el gráfico
function CalcularYDibujarSuma() {
    // Se obtiene el numero de rectangulos
    const n = parseInt(slider.value);
    // Se calcula el ancho de los rectangulos
    const dx = (limiteSuperior - limiteInferior) / n;
    // Variable para guardar el resultado
    let sum = 0;

    // Calculamos la suma de Riemann de 0 a n
    for (let i = 0; i < n; i++) {
        // Calculamos en que posicion del ejex se encuentra el lado derecho del rectangulo
        let x = limiteInferior + i * dx;
        // Calculamos la altura del rectangulo apartir del lado derecho
        let altura = math.evaluate(funcion, {x: x + dx});
        sum += altura * dx;
    }
    // Mostramos el resultado
    resultado.textContent = "La  Suma de Riemann Tomando el lado derecho es: "+sum.toFixed(4);

    // Dibujamos el gráfico
    dibujarGrafico(n, dx);
}

// Función para dibujar el gráfico
function dibujarGrafico(n, dx) {
    const points = [],rectangles = [];

    // Generamos 1000 puntos que nos serviran para trazar una aproximacion de como se ve la funcion
    const numPuntos = 1000;
    // Calculamos cual es la distancia que abra entre cada uno de los puntos
    const step = (limiteSuperior - limiteInferior) / numPuntos;
    for (let x = limiteInferior; x <= limiteSuperior; x += step) {
        // Guardamos las coordenadas de cada punto
        points.push({x: x, y: math.evaluate(funcion, {x: x})});
    }

    // Generamos los necesarios para dibujar los rectángulos
    const numRectangulosParaDibujar = n;
    /// Se calcula la distancia que abra entre los rectangulos ()
    const rectanguloDistancia = Math.max(1, Math.floor(n / numRectangulosParaDibujar));
    for (let i = 0; i < n; i += rectanguloDistancia) {
        // se calcula el lado derecho
        let x = limiteInferior + i * dx;
        // se calcula la altura del rectangulo actual
        let height = math.evaluate(funcion,{x: x + dx});
        // Se almacenae n que punto del eje X esta el lado derecho, en que punto del eje Y esta la base y su altura
        rectangles.push({x: x, y:0, height: height});
    }

    // Configuramos las escalas para que unicamente  aparescan los valores que se encuentran en los limites
    const yExtent = d3.extent(points, d => d.y);
    const yMargin = (yExtent[1] - yExtent[0]) * 0.1;
    xScale.domain([limiteInferior, limiteSuperior]);
    yScale.domain([Math.min(yExtent[0] - yMargin, 0), Math.max(yExtent[1] + yMargin, 0)]);

    // Actualizamos los ejes X e Y para aplicar la escala
    xAxis.call(d3.axisBottom(xScale));
    yAxis.call(d3.axisLeft(yScale));

    // Actualizamos las líneas de los ejes
    svg.select(".x-axis-line")
        .attr("x1", 0)
        .attr("y1", yScale(0))
        .attr("x2", width)
        .attr("y2", yScale(0));

    svg.select(".y-axis-line")
        .attr("x1", xScale(0))
        .attr("y1", 0)
        .attr("x2", xScale(0))
        .attr("y2", height);

    // Dibujamos la función
    const line = d3.line()
         .x(d => xScale(d.x))
         .y(d => yScale(d.y))
         .curve(d3.curveNatural);

    // Pasamos el arreglo de puntos a la función line para que nos devuelva el path
    functionPath.attr("d", line(points));

    // Dibujamos los rectángulos
    const rects = rectGroup.selectAll(".riemann-rect").data(rectangles);

    rects.enter()
        .append("rect")
        .attr("class", "riemann-rect")
        .merge(rects)
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(Math.max(0, d.y + d.height)))
        .attr("width", xScale(dx * rectanguloDistancia) - xScale(0))
        .attr("height", d => Math.abs(yScale(d.y) - yScale(d.y + d.height)))
        .attr("fill", d => "rgba(0, 0, 255, 0.3)")
        .attr("stroke", "none");

    // Sirve para borrar los rectangulos que ya no son necesarios
    rects.exit().remove();
}