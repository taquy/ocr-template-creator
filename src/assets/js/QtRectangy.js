export class QtRectangy {
    constructor(container) {
        this.cube = new Cube(this);

        this.omc = new ObjectModelContainer();
        this.omc.container = container;

    }

    load() {
        this.cube.create($('[resizable]'))
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
            vm.generate($(this))
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
        var cubes = [];
        for (let i = 0; i < 4; i ++) {
            let cube = $("<div>");
            cube.addClass('cube');

            let cp = cubePositions[i];
            let cpx = cp[0] - this.size.w / 2;
            let cpy = cp[1] - this.size.h / 2;

            cube.css({
                top: cpx, left: cpy,
                width: this.size.w,
                height: this.size.h
            });
            cubes.push(cube);
            this.master.omc.container.append(cube);
        }
    }
}

class ObjectModelContainer {
    constructor() {
        this.container = null;
    }
}
