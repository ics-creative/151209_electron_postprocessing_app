/// <reference path="../../typings/tsd.d.ts" />

/**
 * @author Nozomi Nohara / http://github.com/ics-nohara
 * 画面上に表示するオブジェクトをまとめたクラスです。
 */

class TestObjects {

    groups:THREE.Group[] = [];
    renderer:THREE.WebGLRenderer;
    current:number;

    constructor(scene:THREE.Scene, renderer:THREE.WebGLRenderer, spMode:boolean) {

        this.renderer = renderer;

        this.groups.push(this.getImagePlane());
        
        for (var id in this.groups) {
            scene.add(this.groups[id]);
        }
        this.current = 0;
    }

    change(type:number) {

        this.groups[this.current].visible = false;
        this.current = type;
        if (this.current >= this.groups.length) {
            this.current = 0;
        }
        this.groups[this.current].visible = true;

    }

    getImagePlane() {

        var group:THREE.Group = new THREE.Group();
        var texture = THREE.ImageUtils.loadTexture('texture/flower.jpg');
        texture.anisotropy = this.renderer.getMaxAnisotropy();

        var geometry = new THREE.PlaneGeometry(1.5, 1.0, 1, 1);
        var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

        var mesh:THREE.Mesh = new THREE.Mesh(geometry, material);

        mesh.scale.x = mesh.scale.y = 6.0;
        group.add(mesh);

        group.visible = true;
        return group;
    }

    onUpdate() {
    }
}