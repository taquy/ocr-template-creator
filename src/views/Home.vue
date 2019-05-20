
<template>
    <div class="home">

        <div class="master-container">

            <div class="container" canvas moveable>
                <!--<div class="image image2" box resizeable moveable>-->
                <!--</div>-->
            </div>

        </div>

        <form id="form1" runat="server">
            <md-switch v-model="dragging">Dragging</md-switch>

            <md-button class="md-raised md-accent"
                       @click.prevent="qtr.api.exportTemplate"
            >
                Export Template
            </md-button>
            <md-field>
                <label>Upload image:</label>
                <md-file accept="image/*" id="imageUpload"/>
            </md-field>
            <md-field>
                <label>Upload template:</label>
                <md-file id="templateUpload"/>
            </md-field>
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
                this.qtr.opt.mode('DRAGGING');
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
