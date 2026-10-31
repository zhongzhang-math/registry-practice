## Four points on a line and $\overline{M}_{0,5}(\mathbb{R})$

A point of the moduli space $M_{0,5}(\mathbb{R})$ is a list of five distinct labelled points on the real projective line $\mathbb{RP}^1 = \mathbb{R} \cup \{\infty\}$, taken up to the action of $\mathrm{PGL}_2(\mathbb{R})$. Use that action to put the fifth point at $\infty$. The maps that still fix $\infty$ are the affine maps $x \mapsto ax + b$ with $a \neq 0$, so

$$
M_{0,5}(\mathbb{R}) = \{(x_1, x_2, x_3, x_4) \in \mathbb{R}^4 : x_i \neq x_j \text{ for } i \neq j\} \,/\, \{x \mapsto ax + b,\ a \neq 0\},
$$

the space of four distinct labelled real numbers up to translation, scaling and reflection.

Translation and positive scaling remove two of the four dimensions, and what is left is a sphere $S^2$. The reflection $x \mapsto -x$ is the antipodal map of that sphere, so $M_{0,5}(\mathbb{R})$ is the real projective plane $\mathbb{RP}^2$ with the six lines $x_i = x_j$ removed. These lines cut it into $4!/2 = 12$ triangles, one for each ordering of $x_1, \dots, x_4$ taken together with its reverse. An ordering and its reverse are the same cell because $a$ may be negative.

The six lines meet three at a time in four points, where three of the $x_i$ coincide. Blowing up these four points gives the real points of the Deligne–Mumford compactification $\overline{M}_{0,5}$. Each triangle has two such corners, and blowing them up turns it into a pentagon. So $\overline{M}_{0,5}(\mathbb{R})$ is tiled by 12 pentagons. It has 15 vertices, 30 edges and 12 faces, so its Euler characteristic is $-3$; as a surface it is $\mathbb{RP}^2$ blown up at four points, the connected sum of five real projective planes.

### What you're seeing

The four numbered dots are $x_1, \dots, x_4$ on the real line, and the open circle at the end is $\infty$, the fifth point. The configuration moves continuously and repeats every 60 seconds.

The disk is $\mathbb{RP}^2$. Write $p = \sum_i x_i v_i \in \mathbb{R}^3$, where $v_1, \dots, v_4$ are the vertices of a regular tetrahedron centred at the origin. Then $p \cdot v_l$ is $4(x_l - \bar{x})$, with $\bar{x}$ the mean, and the walls $x_i = x_j$ are the six mirror planes of the tetrahedron. The disk is the upper hemisphere of directions of $p$, projected stereographically. A point on its edge is the same point as the one diametrically opposite: at [t = 10.6 s](#t:10.6) the red dot leaves through the edge and comes back on the other side, while nothing special happens on the line.

The red dot is the current configuration, and the filled cell is its ordering. The label 1342 means $x_1 < x_3 < x_4 < x_2$ or the reverse. Cells are shaded alternately by the parity of the ordering. Reversing four labels is an even permutation, so this is well defined, and crossing a wall always changes it.

The solid curves are the walls $D_{ij}$ where $x_i = x_j$. The wall the configuration is approaching brightens, and the readout names it.

The dashed circles are the exceptional curves $D_{l\infty}$. Each replaces the point where the three coordinates other than $x_l$ coincide. After rescaling, three points that bunch together look like three spread-out points with the fourth point $x_l$ far away, so this curve is where $x_l$ meets $\infty$. Opposite points of a dashed circle are glued, which makes each one a crosscap. Watch three dots bunch together at [t = 26.7 s](#t:26.7) as the red dot passes close to a dashed circle.

[Blow up triple points](#param:blowup) switches between the plane $\mathbb{RP}^2$ with its six lines and the blown-up surface.

### Try this

- [Blow-up on: 12 pentagons](#preset:blow-up-on). Pick any cell and count its sides: two lie on dashed circles and three on solid walls. The two walls that do not touch a circle meet at a corner where two pairs of points collide at once.
- [Blow-up off: 12 triangles](#preset:blow-up-off). Three lines pass through each of the four triple points, so six cells meet there, and every cell is a triangle.

### Where it leads

For $n$ marked points, $\overline{M}_{0,n}(\mathbb{R})$ is tiled by $(n-1)!/2$ copies of the associahedron $K_{n-2}$; for $n = 5$ these are the 12 pentagons here. Its ten boundary curves, the six walls $D_{ij}$ and the four circles $D_{l\infty}$, are indexed by the two-element subsets of $\{1, 2, 3, 4, \infty\}$, and two of them meet exactly when their subsets are disjoint. That intersection pattern is the Petersen graph.

**Reference.** S. L. Devadoss, *Tessellations of moduli spaces and the mosaic operad*, in *Homotopy Invariant Algebraic Structures*, Contemporary Mathematics 239, American Mathematical Society, 1999, pp. 91–114.
