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

        // correlated cubes which move relative to one another
        this.corr = [];

        this.hostSize = {};
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

                // if boxes selected elevated index level of itself and so does its satellite cubes
                vm.master.omc.container.find('*').removeClass('active');
                $(this).addClass('active');

                $.each(vm.master.cubes[index], function () {
                    this.entity.addClass('active');
                });
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

                    // calculated original position for correlated cubes
                    vm.corr = vm.findCorrelatedCubes();
                    let hposcx = vm.corr.x.entity.position();
                    vm.corr.x.dist[0] = e.pageX - hposcx.left;
                    vm.corr.x.dist[1] = e.pageY - hposcx.top;

                    let hposcy = vm.corr.y.entity.position();
                    vm.corr.y.dist[0] = e.pageX - hposcy.left;
                    vm.corr.y.dist[1] = e.pageY - hposcy.top;

                    // set host size
                    let host = vm.cubeAudit.host;
                    vm.hostSize = {
                        w: host.width(),
                        h: host.height()
                    };

                    // set cube position
                    vm.target.opos = {x: hpos.left, y: hpos.top};
                }
            }

            // move along with cubes

        }).mousemove(function (e) {
            vm.mouse.x = e.pageX;
            vm.mouse.y = e.pageY;
            if (vm.target) {

                // move size
                let msx = e.pageX - vm.dist[0];
                let msy = e.pageY - vm.dist[1];

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

                    // moving correlated x partner and y partner cube
                    /*
                    Idea:
                    - correlated X will change Y if target Y changed
                    - correlated Y will change X if target X changed
                     */

                    if (vm.corr.y.entity) {
                        vm.corr.y.entity.css({
                            top: e.pageY - vm.corr.y.dist[1]
                        });
                    }

                    if (vm.corr.x.entity) {
                        vm.corr.x.entity.css({
                            left: e.pageX - vm.corr.x.dist[0],
                        });
                    }
                }

                // subtract first relative distance record to keep linear motion
                vm.target.css({
                    left: msx,
                    top: msy
                });

                // calculate size of new rectangle and its position
                if (vm.targetIndex === -1) {
                    // locate root point and width and height of new rectangle
                    let cdx = vm.cubesGroup.map(audit => audit.entity.position().left);
                    let cdy = vm.cubesGroup.map(audit => audit.entity.position().top);

                    let minc = {
                        x: Math.min.apply(null, cdx),
                        y: Math.min.apply(null, cdy),
                    };

                    let maxc = {
                        x: Math.max.apply(null, cdx),
                        y: Math.max.apply(null, cdy),
                    };

                    // find root point TL
                    let rp = vm.cubesGroup.filter(audit => {
                        return audit.entity.position().left === minc.x &&
                            audit.entity.position().top === minc.y
                    })[0];

                    // calculate new width and height
                    let nw = maxc.x - minc.x;
                    let nh = maxc.y - minc.y;
                    let npc = rp.entity.position();

                    // update size and position of box
                    vm.cubeAudit.host.css({
                        width: nw,
                        height: nh,
                        left: npc.left + vm.target.width() / 2,
                        top: npc.top + vm.target.height() / 2,
                    });
                }
            }
        }).mouseup(function (e) {
            // reset everything
            vm.mouse.down = false;
            vm.target = null;
            vm.targetIndex = -1;

            vm.cubesGroup = [];
            vm.cubeAudit = null;

            vm.mouse.recur();
        })
    }

    findCorrelatedCubes() {
        let corrX, corrY;
        for (let i = 0; i < this.cubesGroup.length; i++) {
            let item = this.cubesGroup[i].entity;
            if (item.attr('cube') === this.target.attr('cube')) continue;
            if (!corrX && item.position().left === this.target.position().left)
                corrX = this.cubesGroup[i];

            if (!corrY && item.position().top === this.target.position().top)
                corrY = this.cubesGroup[i];
        }

        return {
            x: corrX,
            y: corrY
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

        // original position
        this.opos = {};
    }
}


class ObjectModelContainer {
    constructor() {
        this.container = null;
        this.cubes = [];
    }
}
