export class QtRectangy {
    constructor(container) {
        this.cube = new Cube(this);
        this.mnu = new Maneuver(this);

        this.omc = new ObjectModelContainer();
        this.omc.container = container;

        // actual raw data
        this.cubes = [];
    }

    load() {
        this.cube.create($('[resizeable]'));
        this.mnu.create($('[moveable]'));
        this.mnu.load();
    }
}

class Maneuver {
    constructor(master) {
        this.master = master;
        this.mouse = new MouseRecorder();
        this.target = null;
        this.targetIndex = -1;
        // offset size to re-center the mouse in object
        this.dist = [];
    }

    create(host) {
        let vm = this;
        host.each(function (index) {
            $(this).mousedown(e => {
                vm.master.mnu.target = $(this);
                vm.master.mnu.targetIndex = index;
                vm.master.mnu.mouse.lx = e.pageX;
                vm.master.mnu.mouse.ly = e.pageY;
            });
        });
    }

    // load for first time
    load() {
        let vm = this;
        this.master.omc.container.mousedown(function (e) {
            vm.mouse.down = true;
            vm.mouse.lx = e.pageX;
            vm.mouse.ly = e.pageY;

            // record distance of mouse and object in first location
            if (vm.target) {
                let hpos = vm.target.position();
                vm.dist[0] = e.pageX - hpos.left;
                vm.dist[1] = e.pageY - hpos.top;
            }
        });

        this.master.omc.container.mousemove(function (e) {
            vm.mouse.x = e.pageX;
            vm.mouse.y = e.pageY;
            if (vm.target) {
                // subtract first relative distance record to keep linear motion
                vm.target.css({
                    left: e.pageX - vm.dist[0],
                    top: e.pageY - vm.dist[1]
                });

                // move along with cubes
                if (vm.targetIndex !== -1) {
                    let cubes = vm.master.cubes[vm.targetIndex];
                    console.log(cubes);
                }
            }
        });
        this.master.omc.container.mouseup(function (e) {
            // reset everything
            vm.mouse.down = false;
            vm.target = null;
            vm.targetIndex = -1;
            vm.mouse.recur();
        })
    }
}

class MouseRecorder {
    constructor() {
        this.down = false;
        this.lx = 0;
        this.ly = 0;
        this.x = 0;
        this.y = 0;
    }

    recur() {
        this.lx = this.x;
        this.ly = this.y;
    }
}

class Cube {
    constructor(master) {
        this.master = master;
        this.size = {
            w: 30, h: 30
        }
    }

    create(host) {
        let vm = this;
        host.each(function () {
            let cubes = vm.generate($(this))
            vm.master.cubes.push(cubes);
        });
    }

    generate(host) {
        let hpos = host.position();
        let hw = host.width();
        let hh = host.height();
        let ht = hpos.top;
        let hl = hpos.left;

        let cubePositions = [
            [ht, hl],
            [ht, hl + hw],
            [ht + hh, hl + hw],
            [ht + hh, hl],
        ];

        // generate 4 cubes
        let cubes = [];
        for (let i = 0; i < 4; i++) {
            let cube = this.makeOne(cubePositions[i]);
            cubes.push(cube);
            this.master.omc.container.append(cube);
        }

        return cubes;
    }

    // create single cube
    makeOne(cp) {
        let cube = $("<div>");
        cube.addClass('cube');

        let cox = this.size.w / 2;
        let coy = this.size.h / 2;

        // attach cube to four corners of host
        cube.css({
            top: cp[0] - cox, left: cp[1] - coy,
            width: this.size.w,
            height: this.size.h
        });

        // attach event of cube
        cube.mousedown(e => {
            this.master.mnu.target = cube;
            this.master.mnu.mouse.lx = e.pageX;
            this.master.mnu.mouse.ly = e.pageY;
        });

        return cube;
    }
}

class ObjectModelContainer {
    constructor() {
        this.container = null;
    }
}
