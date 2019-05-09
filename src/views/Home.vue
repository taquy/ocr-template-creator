
<template>
    <div class="home">

        <div class="container">
            <div class="image" resizable></div>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'home',
        mounted() {
            require('../assets/js/script');
            console.log($('[resizable]'))

        }
    }
</script>

<style>
    @import '../assets/css/style.css';
</style>
