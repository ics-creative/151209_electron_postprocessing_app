/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="shader/shader.d.ts" />
/// <reference path="three_examples.d.ts" />
/// <reference path="TestObjects.ts" />
/**
 * 定番の画像処理をthree.js+シェーダーでいくつか作ってみるデモ
 * https://github.com/ics-nohara/threejs_postprocessing_demo
 * @author Nozomi Nohara / https://github.com/ics-nohara
 */
interface Window {
    superagent:any;
    WebGLRenderingContext:any;
}

interface IShaderMap {
    material:shader.IShader;
    pass:THREE.ShaderPass;
}

module project{
    export let IMAGE_WIDTH:number = 1024;
    export let IMAGE_HEIHGT:number = 638;
}

class Main {
    static canWebGL() : boolean{
        try {
            return !!window.WebGLRenderingContext && !!document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
        } catch( e ) {
            return false;
        }
        return true;
    }
    constructor() {
    }

    private vertexShader:string;
    private currentSelection:string;

    private scene:THREE.Scene;
    private camera:THREE.PerspectiveCamera;
    private renderer:THREE.WebGLRenderer
    private composer:THREE.EffectComposer;

    private effects:{ [key:string]:IShaderMap} = {};
    private effectList:IShaderMap[] = [];
    private normalRenderMode:boolean;
    private mouseX:number;
    private mouseY:number;

    private uzumaki:shader.UzumakiShader;
    private spMode:boolean;
    private vm:Vue;

    private objects:TestObjects;
  
    initialize() {
        this.initVue();
        this.checkSpMode();
        this.startScene();
        this.initMouse();
    }

    initVue() {

        // v-repeat
        this.vm = new Vue({
            el: '#myapp',
            data: {
                shader_change_buttons: [
                    {name: 'ネガポジ反転', id: 'nega', value: false},
                    {name: 'セピア調', id: 'sepia_tone', value: false},
                    {name: 'モザイク', id: 'mosaic', value: false},
                    {name: 'すりガラス', id: 'diffusion', value: false},
                    {name: 'うずまき', id: 'uzumaki', value: false},
                    {name: '2値化(threshold)', id: 'threshold', value: false},
                    {name: '2値化(ランダムディザ)', id: 'random_dither', value: false},
                    {name: '2値化(ベイヤーディザ)', id: 'bayer_dither', value: false}
                ],
                image_change_buttons: [
                    {name: '画像', id: 0, value: 'image'},
                    {name: 'ビデオ', id: 1, value: 'video'}
                ],
                picked: 'image',
                white: "whiteStyle",
                vueApp: "vueApplication"
            },

            methods: {
                _onClick: (e) => {
                    if (e.targetVM.id == "reset") {
                        this.resetShader();
                        for (var i = 0; i < this.vm.data["shader_change_buttons"].length; i++) {
                            this.vm.data["shader_change_buttons"][i].value = false;
                        }
                    } else {
                        e.targetVM.value = !e.targetVM.value;
                        this.changeShader(e.targetVM.id, e.targetVM.value);
                    }
                },
                _onRadioClick: (e) => {
                    this.changeScene(e.targetVM.id);
                }
            }

        });
    }

    changeScene(type:number) {
        this.objects.change(type);
    }

    initMouse() {
        if ("ontouchstart" in window) {
            this.renderer.domElement.addEventListener("touchmove", (event:any) => {
                event.preventDefault();
                this.mouseX = event.changedTouches[0].pageX;
                this.mouseY = event.changedTouches[0].pageY;

            });
        }
        document.addEventListener("mousemove", (event) => {
            this.mouseX = event.pageX;
            this.mouseY = event.pageY;
        });

    }

    isIphone() {
        return (navigator.userAgent.indexOf('iPhone') > 0 &&
            navigator.userAgent.indexOf('iPad') == -1) ||
            navigator.userAgent.indexOf('iPod') > 0;
    }

    checkSpMode() {

        if (this.isIphone() || navigator.userAgent.indexOf('Android') > 0) {
            this.spMode = true;
        } else {
            this.spMode = false;
        }

    }

    initObjects() {
        this.objects = new TestObjects(this.scene, this.renderer, this.spMode);
        if (this.spMode) {
            var changeButton = document.getElementById('object_change');

            changeButton.style.display = 'none';
        }
    }

    resetShader() {
        this.normalRenderMode = true;

        for (var i = 0; i < this.effectList.length; i++) {
            this.effectList[i].pass.enabled = false;
            this.effectList[i].pass.renderToScreen = false;
        }
    }

    changeShader(id:string, value:boolean) {

        this.normalRenderMode = false;
        this.effects[id].pass.enabled = value;

        var renderToScreen:boolean = false;
        for (var i = this.effectList.length - 1; i >= 0; i--) {

            if (this.effectList[i].pass.enabled && !renderToScreen) {
                this.effectList[i].pass.renderToScreen = true;
                renderToScreen = true;
            } else {
                this.effectList[i].pass.renderToScreen = false;
            }

        }
        if (!renderToScreen) {
            this.normalRenderMode = true;
        }
    }


    startScene() {

        //  ThreeeJSの初期化処理
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(77, project.IMAGE_WIDTH /project.IMAGE_HEIHGT, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
        this.renderer.setSize(project.IMAGE_WIDTH,project.IMAGE_HEIHGT);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-wrapper').appendChild(this.renderer.domElement);

        this.initObjects();

        // postprocessing
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

        this.addShaders();
        this.normalRenderMode = true;

        this.camera.position.z = 3;

        var render = () => {
            requestAnimationFrame(render);

            if (this.normalRenderMode) {
                this.renderer.render(this.scene, this.camera);
            } else {
                this.composer.render();
            }


            //  マウス位置を更新
            this.uzumaki.setMousePos(this.mouseX, this.mouseY);

            this.objects.onUpdate();
        };
        render();

    }

    addShaders() {
        this.addEffect("nega", new shader.NegativePositiveShader);
        this.addEffect("sepia_tone", new shader.SepiaToneShader);
        this.addEffect("mosaic", new shader.MosaicShader(project.IMAGE_WIDTH, project.IMAGE_HEIHGT));
        this.addEffect("diffusion", new shader.DiffusionShader(project.IMAGE_WIDTH, project.IMAGE_HEIHGT));

        this.addEffect("uzumaki", this.uzumaki = new shader.UzumakiShader(project.IMAGE_WIDTH, project.IMAGE_HEIHGT));
        this.uzumaki.uniforms = this.effects["uzumaki"].pass.uniforms;

        this.addEffect("threshold", new shader.ThresholdShader);
        this.addEffect("random_dither", new shader.RandomDitherShader);
        this.addEffect("bayer_dither", new shader.BayerDitherShader(project.IMAGE_WIDTH, project.IMAGE_HEIHGT));

        if (this.spMode) {
            this.uzumaki.setUzumakiScale(75);

        }
    }

    addEffect(name:string, shader:shader.IShader) {

        var pass = new THREE.ShaderPass(shader);
        this.composer.addPass(pass);
        pass.renderToScreen = false;
        pass.enabled = false;
        this.effects[name] = {material: shader, pass: pass};

        //  順番用
        this.effectList.push(this.effects[name]);
    }

}
;