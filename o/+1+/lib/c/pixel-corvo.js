speed = 0.
noise(-1,3,2).out(o0)
src(o0).modulatePixelate(
voronoi(2)
).colorama(()=>time)
.diff(
  src(o1).scroll(0,0.32)
).out(o1)
render(o1)