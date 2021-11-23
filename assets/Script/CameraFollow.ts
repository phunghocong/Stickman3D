
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('CameraFollow')
export class CameraFollow extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property(Node)
    public player : Node = null;


    private newPos = new Vec3();

    private curPos = new Vec3();

    start () {
     
    }

    update (deltaTime: number) {

        let p1 = this.player.getPosition();
    
        this.newPos = new Vec3(p1.x, p1.y + 3, 20);

        this.curPos = this.node.getPosition();

        this.curPos = this.newPos;

        this.node.setPosition(this.curPos);
    }
}
