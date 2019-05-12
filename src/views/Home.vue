
<template>
    <div class="home">
        <form>
            <input type="checkbox" v-model="dragging">Dragging
        </form>

        <div class="master-container">

            <div class="container">
                <div class="image" box resizeable moveable></div>
                <div class="image2" box resizeable moveable></div>
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
                dragging: false,
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.qtr = new QtRectangy($('.container'));
                this.qtr.load();
            });
        },

        watch: {
            dragging(v) {
                console.log(v)
            }
        }
    }
</script>

<style>
    @import '../assets/css/style.css';
</style>
