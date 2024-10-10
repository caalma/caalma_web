speed = 0
let n = 57
osc(n,0.01,1).diff(
  osc(n, 0.01, 0.1)
     .rotate(Math.PI / 2)
).scale(0.2)
.rotate(0.3)
.modulateScale(
   shape(n, 0.1, 0.6), 
   ()=>Math.sin(time)*n*n
).out()