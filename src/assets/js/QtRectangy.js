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
        this.dist = [];

        this.cubesGroup = [];
        this.cubeAudit = null;
    }

    create(host) {
        let vm = this;
        // there are two types: cropper box and resizing cubes
        let boxes = host.filter('[box]');
        let cubes = host.filter('[cube]');

        boxes.each(function (index) {
            $(this).mousedown(e => {
                vm.master.mnu.target = $(this);
                vm.master.mnu.targetIndex = index;
                vm.master.mnu.mouse.lx = e.pageX;
                vm.master.mnu.mouse.ly = e.pageY;
            });
        });

        cubes.each(function (index) {
            $(this).mousedown(e => {
                vm.master.mnu.target = $(this);
                vm.master.mnu.mouse.lx = e.pageX;
                vm.master.mnu.mouse.ly = e.pageY;
            });
        });
    }

    // load for first time
    load() {
        let vm = this;
        $(document).mousedown(function (e) {
            vm.mouse.down = true;
            vm.mouse.lx = e.pageX;
            vm.mouse.ly = e.pageY;

            // record distance of mouse and object in first location
            if (vm.target) {

                // calculate original position for box
                let hpos = vm.target.position();
                vm.dist[0] = e.pageX - hpos.left;
                vm.dist[1] = e.pageY - hpos.top;

                // move along with cubes
                if (vm.targetIndex !== -1) {
                    let cubes = vm.master.cubes[vm.targetIndex];
                    cubes.forEach(cube => {
                        let hpos = cube.entity.position();
                        cube.dist[0] = e.pageX - hpos.left;
                        cube.dist[1] = e.pageY - hpos.top;
                    });
                } else {
                    vm.setTargetEntity();

                    // calculate original position for cube
                    let hpos = vm.target.position();
                    vm.cubeAudit.dist[0] = e.pageX - hpos.left;
                    vm.cubeAudit.dist[1] = e.pageY - hpos.top;
                }
            }

            // move along with cubes

        }).mousemove(function (e) {
            vm.mouse.x = e.pageX;
            vm.mouse.y = e.pageY;
            if (vm.target) {
                // check moving target is box
                if (vm.targetIndex !== -1) {

                    // move cubes along with box
                    let cubes = vm.master.cubes[vm.targetIndex];
                    cubes.forEach(cube => {
                        cube.entity.css({
                            left: e.pageX - cube.dist[0],
                            top: e.pageY - cube.dist[1]
                        });
                    });
                } else {
                    // cube position code
                    var cpc = vm.gps(vm.cubesGroup);

                    // moving correlated x partner and y partner cube
                    let corr = vm.findCorrelatedCubes();

                    /*
                    Idea:
                    - correlated X will change Y if target Y changed
                    - corellated Y will change X if target X changed
                     */
                    //
                    if (corr.y) {
                        corr.y.css({
                            top: e.pageY - vm.dist[1]
                        });
                    }

                    if (corr.x) {
                        corr.x.css({
                            left: e.pageX - vm.dist[0],
                        });
                    }
                }

                // subtract first relative distance record to keep linear motion
                vm.target.css({
                    left: e.pageX - vm.dist[0],
                    top: e.pageY - vm.dist[1]
                });
            }
        }).mouseup(function (e) {
            // reset everything
            vm.mouse.down = false;
            vm.target = null;
            vm.targetIndex = -1;
            vm.mouse.recur();
        })
    }

    findCorrelatedCubes() {
        let cubeDoms = this.cubesGroup.map(cubeAudit => cubeAudit.entity);

        let correlateX = cubeDoms.filter(item => {
           return item.attr('cube') !== this.target.attr('cube') && item.position().left === this.target.position().left;
        })[0];

        let correlateY = cubeDoms.filter(item => {
            return item.attr('cube') !== this.target.attr('cube') && item.position().top === this.target.position().top;
        })[0];

        return {
            x: correlateX,
            y: correlateY
        }
    }

    setTargetEntity() {
        // 0: box, 1: cube
        let entityId = this.target.attr('cube').split('.');
        let boxIndex = entityId[0];
        let cubeIndex = entityId[1];

        this.cubesGroup = this.master.cubes[boxIndex];
        this.cubeAudit = this.cubesGroup[cubeIndex];

    }

    gps(cubes) {
        let cbs = cubes.map(cube => cube.entity.position());
        let cbsx = cbs.map(p => p.left);
        let cbsy = cbs.map(p => p.top);

        // find min position of four corner cubes

        let x = {
            max: Math.max.apply(null, cbsx),
            min: Math.min.apply(null, cbsx),
        };

        let y = {
            max: Math.max.apply(null, cbsy),
            min: Math.min.apply(null, cbsy),
        };

        // current position
        var cp = this.target.position();
        // position code: TL, TR, BL, BR
        let pc = '';

        if (cp.top >= y.max) pc += 'B';
        else pc += 'T';

        if (cp.left >= x.max) pc += 'R';
        else pc += 'L';

        return pc;
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
            let cubes = vm.generate($(this));
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
            let hostIndex = $('[box]').index(host);
            let cubeId = hostIndex + '.' + i;
            let cube = this.makeOne(cubePositions[i], cubeId);

            this.master.omc.container.append(cube);

            // objectify cube
            let cubeAudit = new CubeAudit(cube);
            cubeAudit.host = host;
            cubes.push(cubeAudit);
        }

        return cubes;
    }

    // create single cube
    makeOne(cp, cubeId) {
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
        cube.attr('moveable', '');
        cube.attr('cube', cubeId);

        return cube;
    }
}

class CubeAudit {
    constructor(entity) {
        // contain actual cube
        this.entity = entity;

        // record movement of cube
        this.mouse = new MouseRecorder();

        // host that cubes are attached to
        this.host = null;

        this.dist = [];
    }
}


class ObjectModelContainer {
    constructor() {
        this.container = null;
        this.cubes = [];
    }
}
