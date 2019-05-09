export class QtRectangy {
    constructor(container) {
        this.cube = new Cube(this);
        this.mnu = new Maneuver(this);

        this.omc = new ObjectModelContainer();
        this.omc.container = container;

    }

    load() {
        this.cube.create($('[resizable]'));
        this.mnu.load();
    }
}

class Maneuver {
    constructor(master) {
        this.master = master;
        this.mouse = new MouseRecorder();
    }

    // load for first time
    load() {
        let vm = this;
        this.master.omc.containe.mousedown(function (e) {
            vm.mouse.down = true;
            vm.mouse.lx = e.pageX;
            vm.mouse.ly = e.pageY;
        });

        this.master.omc.container.mouseup(function (e) {
            vm.mouse.x = e.pageX;
            vm.mouse.y = e.pageY;
        });
        this.master.omc.container.mouseup(function (e) {
            vm.mouse.down = false;
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

        let cpx = cp[0] - this.size.w / 2;
        let cpy = cp[1] - this.size.h / 2;

        cube.css({
            top: cpx, left: cpy,
            width: this.size.w,
            height: this.size.h
        });

        return cube;
    }
}

class ObjectModelContainer {
    constructor() {
        this.container = null;
    }
}
