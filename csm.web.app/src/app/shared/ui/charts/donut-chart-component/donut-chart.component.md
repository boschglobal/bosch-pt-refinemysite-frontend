#Donut Chart Component

##Logic

[Process of drawing a slice](https://cdn-images-1.medium.com/max/1200/1*bNYFaf7Gs31893lnwRHzTg.png)

##Implementation

###Center the start drawing points

####Option 1

```html
<svg viewBox="-1 -1 2 2" style="transform: rotate(-0.25turn)"></svg>
```

####Option 2

```html
<g style="transform: translate(width / 2, height / 2)"></g>
```

[Circle transformed](https://cdn-images-1.medium.com/max/2000/1*EMmU4BJtQwZXRKhof76SvA.png)


####Conclusion

By aligning the SVG coordinate system with the cartesian coordinate system:

1. I don’t need to multiply the sin/cos results by the radius
2. 0,0 is now in the center of the SVG, not the top left
3. Slices will begin at the top of the circle, not the right

[Math problem](https://cdn-images-1.medium.com/max/1200/1*bNYFaf7Gs31893lnwRHzTg.png)

###Drawing an arc

[Important](https://vkbansal.me/img/drawing-arc_4cc02b.png)

By the following image we define:

`P = [r2 + r2sin(a),r2-r2cos(a)]`

`Q = [r2 + r2sin(B),r2-r2cos(B)]`

`R = [r2 + r1sin(B),r2-r1cos(B)]`

`S = [r2 + r1sin(a),r2-r1cos(a)]`

```html
<path d="M P.x,P.y A r2,r2 0 0,1 Q.x,Q.y L R.x,R.y A r1,r1 0 0,0 S.x,S.y Z" />
```

###Understanding `<path>` syntax

[Important](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)

>The `<path>` element is the most powerful element in the SVG library of basic shapes. You can use it to create lines, curves, arcs and more.

The following commands are available for path data:

* M = moveto
* L = lineto
* H = horizontal lineto
* V = vertical lineto
* C = curveto
* S = smooth curveto
* Q = quadratic Bézier curve
* T = smooth quadratic Bézier curveto
* A = elliptical Arc
* Z = closepath

To draw a simple slice of a pie we can do it like so:
```html
<path d=”M 1 0 A 1 1 0 0 1 0.4 0.30 L 0 0"></path>
```

The code above explained:

`M 1 0` means move to our start position

`A 1 1 0 0 1 0.4 0.30` === `rx ry x-axis-rotation large-arc-flag sweep-flag x y` draws an arc
  * `rx and ry` = Radius of the circle
  * `x-axis-rotation` = This does not make sense to draw a circle
  * `large-arc-flag` = The arc go the long way around or the short way
  * `x-axis-rotation` = This does not make sense to draw a circle
  * `sweep-flag` = For pies, it’s always 1
  * `x and y` = Where our path ends

`L 0 0` Draw a straight line (L) to the middle (0,0) of the circle

Draw empty circle:

* `M cx, cy` = Move to center of ring
* `m 0 -outerRadius`= Move to top of ring
* `a outerRadius, outerRadius, 0, 1, 0, 1, 0` = Draw outer arc, but don't close it
* `Z` = Close the outer shape
* `m -1 outerRadius-innerRadius` = Move to top point of inner radius
* `a innerRadius, innerRadius, 0, 1, 1, -1, 0` = Draw inner arc, but don't close it
* `Z` = Close the inner ring

##Important logic
 
```typescript
// each slice starts where the last slice ended, so keep a cumulative start angle
this._startAngle += sectorAngle;
```

```typescript
// if the slice is more than 50%, take the large arc (the long way around)
endAngle - startAngle > Math.PI;
```

```typescript
// scale the data linearly between 0 and 2π
value * Math.PI * 2 / this.getTotal;
```
 
Build with <3 by jcunhafonte