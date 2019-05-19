export class QtRectangy {
    constructor() {
        this.mnu = new Maneuver(this);

        this.omc = new ObjectModelContainer(this);
        this.cube = new Cube(this);

        // re-positioning mode
        this.strategy = {
            p: new PositioningStrategy(this),
            d: new DrawingROIStrategy(this),
        };

        // set zoomer
        this.zoom = new Zoomer(this);

        // set keyboard
        this.kw = new KeyWatch(this);

        // options
        this.opt = new OptionMenu();
    }

    load() {
        this.mnu.create($('[moveable]'));
        this.mnu.load();
        this.zoom.load();
        this.kw.load();
    }
}

class OptionMenu {
    constructor() {
        this.reset();
    }

    mode(mode) {
        this.p = mode === 'DRAGGING';
        this.d = mode === 'DRAWING';

        // set default option
        if (!mode) this.reset();
    }

    reset() {
        this.p = false;
        this.d = true;
    }
}

class KeyWatch {
    constructor(master) {
        this.master = master;
    }

    load() {
        let vm = this;
        document.onkeydown = keypress;

        function keypress (e) {
            let kc = e.keyCode;
            if (e.ctrlKey) {
                if (kc === 90) {
                    let box = vm.master.omc.boxes.pop();
                    vm.master.omc.removedBoxes.push(box);
                    vm.master.omc.redraw();
                }

                if (kc === 89) {
                    let box = vm.master.omc.removedBoxes.pop();
                    if (!box) return;
                    vm.master.omc.boxes.push(box);
                    vm.master.omc.redraw();
                }
            }

        }
    }
}

class Zoomer {
    constructor(master) {
        this.master = master;
        // ratio of containers
        this.current = 1;
    }

    load() {
        $('.master-container').off('wheel').on('wheel', e => {
            this.zoom(e);
        });
    }

    zoom(e) {
        e.preventDefault();
        e.stopPropagation();

        this.master.omc.container.find('*').removeClass('active');

        let step = 0.02;

        let isUp = e.originalEvent.deltaY < 0;

        // update style of elements
        let ctn = $('.container');

        // find new ratio for container
        var r = this.current;
        if (isUp) {
            r += step;
        } else {
            r -= step;
        }

        $('.container').css({
            width: ctn.width() * r,
            height: ctn.height() * r
        });

        // resize box

        $('[box]').each(function (e) {

            let p = $(this).position();

            let ow = $(this).width();
            let oh = $(this).height();

            let nw = ow * r;
            let nh = oh * r;

            $(this).css({
                width: nw,
                height: nh,
                top: p.top * r,
                left: p.left * r
            });

        });
    }
}

class Maneuver {
    constructor(master) {
        this.master = master;
        this.mouse = new MouseRecorder();
        this.target = null;
        this.dist = [];
    }

    create(host) {
        let vm = this;
        // there are two types: cropper box and resizing cubes
        let boxes = host.filter('[box]');
        let cubes = host.filter('[cube]');
        let canvas = host.filter('[canvas]');

        canvas.each(function () {
            $(this).off('mousedown').mousedown(e => {
                vm.master.mnu.target = $(e.target);
                vm.master.mnu.mouse.lx = e.pageX;
                vm.master.mnu.mouse.ly = e.pageY;
            });
        });

        boxes.each(function () {
            $(this).off('mousedown').mousedown(e => {
                // e.stopPropagation();
                vm.master.mnu.target = $(e.target);

                // if boxes selected elevated index level of itself and so does its satellite cubes
                vm.master.omc.container.find('*').removeClass('active');
                vm.master.cube.attach($(e.target));

                if (vm.master.opt.p) {
                    $(this).addClass('active');
                    $.each(vm.master.cube.cubes, function () {
                        this.entity.addClass('active');
                    });
                }
            });
        });

        cubes.each(function () {
            $(this).off('mousedown').mousedown(e => {
                vm.master.mnu.target = $(this);
                vm.master.mnu.mouse.lx = e.pageX;
                vm.master.mnu.mouse.ly = e.pageY;
            });
        });
    }

    // load for first time
    load() {
        let vm = this;


        $('html').off('mousedown').mousedown(function (e) {
            vm.mouse.down = true;

            if (vm.master.opt.p) {
                vm.master.strategy.p.register(vm, e)
            } else if (vm.master.opt.d) {
                vm.master.strategy.d.register(vm, e)
            }

        }).off('mousemove').mousemove(function (e) {
            if (vm.master.opt.p) {
                vm.master.strategy.p.action(vm, e);
            } else {
                vm.master.strategy.d.action(vm, e)
            }

        }).off('mouseup').mouseup(function (e) {
            // reset everything
            vm.closeEvent();
        });

        $('document').off('mouseup').mouseup(this.closeEvent);
        $(window).off('blur').on('blur', this.closeEvent);
        $(document).off('blur').on('blur', this.closeEvent);

    }

    closeEvent() {
        if (this.mouse) {
            this.mouse.down = false;
            this.mouse.recur();
        } else {
            this.mouse = new MouseRecorder();
        }

        this.target = null;

        if (this.master) {
            this.master.strategy.p.cubeAudit = null;
            this.master.strategy.d.after();
            this.master.strategy.d.target = null;
        }
    }

}

class DrawingROIStrategy {
    constructor(vm) {
        this.master = vm;
        this.target = null;

        this.sp = {};
        this.ep = {};
    }

    randBg() {
        let x = Math.floor(Math.random() * 256);
        let y = Math.floor(Math.random() * 256);
        let z = Math.floor(Math.random() * 256);
        return "rgb(" + x + "," + y + "," + z + ")";
    }

    register(vm, e) {
        // create audit and append to
        this.target = this.draw(vm);

        this.sp = this.getRatPos(e);

        this.target.css({
            width: 0,
            height: 0,
        });
    }

    draw(vm) {
        // create new box
        let target = $('<div/>');

        this.master.omc.container.find('*').removeClass('active');
        target.addClass('active');

        target.attr('box', '');
        target.attr('resizeable', '');
        target.attr('moveable', '');
        target.addClass('image');
        target.css({
            borderColor: this.randBg()
        });

        // create new label
        let label = $('<input class="label"/>');
        let labelBg = target.css("borderColor");
        labelBg = labelBg.split(",");

        if (labelBg.length === 4) {
            labelBg[labelBg.length - 1] = 0.5 + ")";
        } else if (labelBg.length === 3) {
            labelBg[labelBg.length - 1] = labelBg[labelBg.length - 1].replace(/[)]+/g, '');
            labelBg.push(0.5 + ")");
        }

        labelBg = labelBg.join(",");

        label.css({
            backgroundColor: labelBg
        });

        function resizeInput() {
            $(this).attr('size', $(this).val().length);
        }

        label.off('keyup')
            .keyup(resizeInput)
            .each(resizeInput);

        // label.keyup(function (e) {
        //     console.log(e);
        // });
        target.append(label);

        vm.master.omc.container.append( target);
        vm.master.load();

        return target;
    }

    getRatPos(e) {
        let mso = $('.master-container').position();
        return {
          x: e.pageX - mso.left,
          y: e.pageY - mso.top
        };
    }

    action(vm, e) {

        if (!this.target) return;

        this.ep = this.getRatPos(e);

        let min = {x: 0, y: 0};
        let max = {x: 0, y: 0};

        let isMinX = this.sp.x > this.ep.x;
        let isMaxX = this.sp.y > this.ep.y;
        min.x = isMinX ? this.ep.x : this.sp.x;
        max.x = isMinX ? this.sp.x : this.ep.x;
        min.y = isMaxX ? this.ep.y : this.sp.y;
        max.y = isMaxX ? this.sp.y : this.ep.y;

        let w = max.x - min.x;
        let h = max.y - min.y;

        let ctnp = $('.container').position();
        let offset = {
            x: ctnp.left,
            y: ctnp.top,
        };

        this.target.css({
            width: w,
            height: h,
            left: min.x - offset.x,
            top: min.y - offset.y
        });

    }

    after() {
        let tg = this.target;
        if (tg && (tg.width() < 20 || tg.height() < 20)) {
            tg.remove();
        } else {
            let boxAudit = new BoxAudit(tg);
            this.master.omc.boxes.push(boxAudit);
        }
    }
}

class PositioningStrategy {
    constructor(vm) {
        this.master = vm;

        this.cubeAudit = null;

        // correlated cubes which move relative to one another
        this.corr = [];
    }

    register(vm, e) {

        // record distance of mouse and object in first location
        if (!vm.target) return;

        let cubesGroup = this.master.cube.cubes;

        // calculate original position for box
        let hpos = vm.target.position();


        vm.dist[0] = e.pageX - hpos.left;
        vm.dist[1] = e.pageY - hpos.top;

        // move along with cubes
        // reposition cubes
        if (vm.target[0].hasAttribute('box')) {

            if (vm.target[0].hasAttribute('resizeable')) {
                vm.master.cube.cubes.forEach(cube => {
                    let hpos = cube.entity.position();
                    cube.dist[0] = e.pageX - hpos.left;
                    cube.dist[1] = e.pageY - hpos.top;
                });
            }

        } else if (vm.target[0].hasAttribute('cube')) {
            let entityId = $('[cube]').index(vm.target);
            this.cubeAudit = cubesGroup[entityId];

            // calculate original position for cube
            let hpos = vm.target.position();
            this.cubeAudit.dist[0] = e.pageX - hpos.left;
            this.cubeAudit.dist[1] = e.pageY - hpos.top;

            // calculated original position for correlated cubes
            this.corr = this.findCorrelatedCubes(vm);

            let hposcx = this.corr.x.entity.position();
            this.corr.x.dist[0] = e.pageX - hposcx.left;
            this.corr.x.dist[1] = e.pageY - hposcx.top;

            let hposcy = this.corr.y.entity.position();
            this.corr.y.dist[0] = e.pageX - hposcy.left;
            this.corr.y.dist[1] = e.pageY - hposcy.top;
        }
    }

    action(vm, e) {
        e.stopPropagation();
        if (!vm.target) return;

        this.preAct(vm, e);

        // subtract first relative distance record to keep linear motion
        this.onAct(vm, e);

        // calculate size of new rectangle and its position
        this.postAct(vm, e);
    }

    onAct(vm, e) {
        // move size
        let msx = e.pageX - vm.dist[0];
        let msy = e.pageY - vm.dist[1];

        var isMovable = vm.target[0].hasAttribute('moveable');

        if (!isMovable) return;

        vm.target.css({
            left: msx,
            top: msy
        });
    }

    postAct(vm, e) {
        let isCube = vm.target[0].hasAttribute('cube');
        let isBox = vm.target[0].hasAttribute('box');
        if (isCube) {
            let cubesGroup = this.master.cube.cubes;

            // locate root point and width and height of new rectangle
            let cdx = cubesGroup.map(audit => audit.entity.position().left);
            let cdy = cubesGroup.map(audit => audit.entity.position().top);

            let minc = {
                x: Math.min.apply(null, cdx),
                y: Math.min.apply(null, cdy),
            };

            let maxc = {
                x: Math.max.apply(null, cdx),
                y: Math.max.apply(null, cdy),
            };

            // find root point TL
            let rp = cubesGroup.filter(audit => {
                return audit.entity.position().left === minc.x &&
                    audit.entity.position().top === minc.y
            })[0];

            // calculate new width and height
            let nw = maxc.x - minc.x;
            let nh = maxc.y - minc.y;

            // calculate new position
            let npc = rp.entity.position();
            let hnx = npc.left + vm.target.width() / 2;
            let hny = npc.top + vm.target.height() / 2;

            // update size and position of box
            let host = this.cubeAudit.host;
            host.css({
                width: nw,
                height: nh,
                left: hnx,
                top: hny,
            });

            // store position and size of host relative to original position and size
            // vm.master.zoom.restartSize(host);

        } else if (isBox) {
            // vm.master.zoom.restartPosition(vm.target);
        }
    }

    preAct(vm, e) {
        // check moving target is box
        if (vm.target[0].hasAttribute('box')) {

            // move cubes along with box
            vm.master.cube.cubes.forEach(cube => {
                cube.entity.css({
                    left: e.pageX - cube.dist[0],
                    top: e.pageY - cube.dist[1]
                });
            });

        } else if (vm.target[0].hasAttribute('cube')) {

            // moving correlated x partner and y partner cube
            /*
            Idea:
            - correlated X will change Y if target Y changed
            - correlated Y will change X if target X changed
             */

            if (this.corr.y.entity) {
                this.corr.y.entity.css({
                    top: e.pageY - this.corr.y.dist[1]
                });
            }

            if (this.corr.x.entity) {
                this.corr.x.entity.css({
                    left: e.pageX - this.corr.x.dist[0],
                });
            }
        }
    }

    findCorrelatedCubes(vm) {
        let corrX, corrY;
        let cubes = this.master.cube.cubes;

        for (let i = 0; i < cubes.length; i++) {

            let item = cubes[i].entity;

            if (item.attr('cube') === vm.target.attr('cube')) continue;

            if (!corrX && item.position().left === vm.target.position().left)
                corrX = cubes[i];

            if (!corrY && item.position().top === vm.target.position().top)
                corrY = cubes[i];
        }

        return {
            x: corrX,
            y: corrY
        }
    }
}

class MouseRecorder {
    constructor() {
        this.down = false;
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
            w: 15, h: 15
        };

        // create 4 cubes
        this.cubes = Array.from(Array(4), ((_, i) => {
            let cube = this.makeOne(i);
            this.master.omc.container.append(cube);
            return new CubeAudit(i, cube);
        }));
    }

    attach(host) {

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

        cubePositions.forEach((cp, i) => {
            let cube = this.cubes[i];
            cube.host = host;
            this.placing(cube.entity, cp);
        });

    }

    // create single cube
    makeOne(cubeId) {
        let cube = $("<div>");
        cube.addClass('cube');

        // attach cube to four corners of host
        cube.css({
            width: this.size.w,
            height: this.size.h
        });

        // attach event of cube
        cube.attr('moveable', '');
        cube.attr('cube', cubeId);

        return cube;
    }

    placing(cube, cp) {
        let cox = this.size.w / 2;
        let coy = this.size.h / 2;

        cube.css({
            top: cp[0] - cox,
            left: cp[1] - coy,
        });
    }
}

class CubeAudit {
    constructor(id, entity) {
        this.id = id;

        // contain actual cube
        this.entity = entity;

        // host that cubes are attached to
        this.host = null;

        this.dist = [];
    }
}

class BoxAudit {
    constructor(entity = null) {
        this.set(entity);
    }

    set(entity) {
        if (!entity) return;
        this.entity = entity;

        let ctns = this.getContainerSize();
        this.x = entity.position().left / ctns.w;
        this.y = entity.position().top / ctns.h;
        this.w = entity.width() / ctns.w;
        this.h = entity.height() / ctns.h;
    }

    getContainerSize() {
        let ctn = $('.container');
        return {
            w: ctn.width(),
            h: ctn.height(),
            x: ctn.position().left,
            y: ctn.position().top
        }
    }
}

class ObjectModelContainer {
    constructor(master) {
        this.master = master;
        this.container = $('.container');
        this.boxes = [];
        this.removedBoxes = [];
    }

    resetUndo() {
        this.removedBoxes = [];
    }

    redraw() {
        $('[box]').remove();
        let vm = this;
        let drawer = this.master.strategy.d;
        this.boxes.forEach(function (item) {

            let ctns = item.getContainerSize();

            let target = drawer.draw(vm);
            target.css({
                width: item.w * ctns.w,
                height: item.h * ctns.h,
                left: item.x * ctns.w,
                top: item.y * ctns.h,
            });
        })
    }
}
