
<template>
    <div class="home">

        <div class="container">
            <div class="image" resizable></div>
        </div>

    </div>
</template>

<script>
    import { QtRectangy } from '../assets/js/QtRectangy';
    export default {
        name: 'home',
        data() {
            return {
                qtr: new QtRectangy()
            }
        },
        mounted() {
        }
    }
</script>

<style>
    @import '../assets/css/style.css';
</style>
