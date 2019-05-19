
<template>
    <div class="home">

        <div class="master-container">

            <div class="container" canvas moveable>
                <div class="image image2" box resizeable moveable>
                </div>
            </div>

        </div>

        <form id="form1" runat="server">
            <input type="checkbox" v-model="dragging">Dragging
            <button v-if="qtr"
                    @click.prevent="qtr.api.exportTemplate">Export Template</button>


            Upload image:
            <input type="file" id="imageUpload"/>

            Upload template:
            <input type="file" id="templateUpload"/>
        </form>

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
                this.qtr = new QtRectangy();
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
