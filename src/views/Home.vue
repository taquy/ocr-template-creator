
<template>
    <div class="home">
        <form>
            <input type="checkbox" v-model="dragging">Dragging
        </form>

        <div class="master-container">

            <div class="container" canvas moveable>
                <!--<div class="paint"></div>-->
                <!--<div class="image" box resizeable moveable></div>-->
                <div class="image image2" box resizeable moveable>
                    <!--<input class="label" value="xxx">-->
                </div>
            </div>

        </div>

    </div>
</template>

<script>
    import { QtRectangy } from '../assets/js/QtRectangy';
    export default {
        name: 'home',

        data() {
            return {
                qtr: null,
                dragging: true,
            }
        },

        mounted() {
            this.$nextTick(() => {
                this.qtr = new QtRectangy($('.container'));
                this.qtr.load();

                // this.qtr.opt.mode('DRAWING');
                this.qtr.opt.mode('DRAWING');
            });
        },

        watch: {
            dragging(v = null) {
                v = v ? 'DRAGGING' : null;
                this.qtr.opt.mode(v);
            }
        }
    }
</script>

<style>
    @import '../assets/css/style.css';
</style>
