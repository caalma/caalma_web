
Figura:

```
Me dicen:

che,
loco,
amigo,
bestia,
carlos,
cabezón,
carlitos,
ordenado,
comunista,
ahorrativo,
biciclista,
sistemático,
desordenado,
estructurado,
vegetariano ,
inteligente,
macheratti,
complicado,
peronista,
paciente,
atareado,
charles,
pelado,
peludo,
barba,
raro,
vos.

Y talvez
se refieran a mi.
```
---

Fondo:

```
-- minitidal en estuary
-- !reslist "https://caalma.github.io/curso_ptav_estuary/audio/samples.json"
stack [
  slow 1.4 $ s "metal ~ ~?" # n (irand 5) # up "0 3 5 2 6 7 4 9 1" # speed "[-1 -2]" # gain "[0.7 .. 1]"
  , slow 1.3 $ s "~ metal ~?" # n (irand 5) # up ("0 3 5 2 6 7 4 9 1" * "-1") # speed "[0.8 0.6]" # gain "[0.6 .. 0.9]"
  , s "<golpe*<7 11 13> varios>" # n (irand 15) # gain 0.6
  , slow 3 $ s "frotado?" # n "1 .. 5"
] # gain "1.0 .. 0.0" # pan sine -- # silence
```

Junto:
[Audio](./audio.mp3)
