
<template>
    <div class="home">

        <div class="container">
            <div class="image" resizable moveable></div>

            <div class="image2" resizable moveable></div>

        </div>

    </div>
</template>

<script>
    import { QtRectangy } from '../assets/js/QtRectangy';
    export default {
        name: 'home',
        data() {
            return {
                qtr: null
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.qtr = new QtRectangy($('.container'));
                this.qtr.load();
            });
        }
    }
</script>

<style>
    @import '../assets/css/style.css';
</style>
