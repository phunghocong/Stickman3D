
import { _decorator, Component, Node, RigidBody, Vec3, SystemEvent, systemEvent, KeyCode, EventKeyboard, EventMouse, Collider, geometry, Vec2,Animation,BoxCollider, ICollisionEvent, director, Quat,AnimationState, AnimationClip, PhysicsSystem, Director, game } from 'cc';
const { ccclass, property } = _decorator;
// const { ray } = geometry;

const _tempDelta = new Vec2();
const Horizontal = new Vec2(1, 0);
const _tempPos = new Vec3();
 
@ccclass('PlayerMovement')
export class PlayerMovement extends Component {

    @property({type: RigidBody})
    public rigidBody : RigidBody|null = null;


    @property( Animation)
    public animate: Animation = null;

    @property
    queryTrigger = true;

    

    private isRunning = false;
    private onTheGround = true;
    static instance: PlayerMovement;
      
    private quat = new Quat();
    private vec3 = new Vec3();

    
    private accLeft = false;
    private accRight = false;
    private isJumping = false;

    private canJump = true;

    public jumpTimer = 0.3;

    public currentTimer = this.jumpTimer;


    private boxRight = false;

    private boxLeft = false;

    private isNextBox =  false;

    private mask: number = 0xffffffff;

    private isPushing = false;
    


    onLoad () {
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
      
        this.animate = this.node.getComponent(Animation);


    }
   
    start () {
        if (this.rigidBody.isSleeping) {
            this.rigidBody.wakeUp();
        }

        this.animate.play("")

        


        let collider = this.getComponent(Collider);
        collider.on('onCollisionEnter', this.onCollision, this);
        collider.on('onCollisionStay', this.onCollision, this);
        collider.on('onCollisionExit',this.onCollision, this);
        
    }

   

    onDestroy () {
        systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        
    }

  

    onKeyDown (event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_D:
                if(!this.accRight){
                    this.accRight = true;
                    this.turnRight()
                  }
                  this.accLeft = false;
                  if(this.isNextBox && this.boxRight){
            
                    this.pushingBox()
                  }
                break;
            case KeyCode.KEY_A:
                if(!this.accLeft){
                    
                    this.accLeft = true;
                    this.turnLeft()
                  }
        
                  this.accRight = false;

                  
                if(this.isNextBox && this.boxLeft){
                this.pushingBox()
            
                }
                break;
            case KeyCode.SPACE:
                if(this.canJump){
                    this.JumpAnimation()
                    this.isJumping = true;
                    this.canJump = false;
                    
                  }
                  break;
        }
    }

    onKeyUp (event: EventKeyboard) {
        this.playIdleAnimation()
        this.rigidBody.setLinearVelocity(new Vec3(0, 0,0))
        switch(event.keyCode) {
            case KeyCode.KEY_D:
                this.accRight = false;
                break;
            case KeyCode.KEY_A:
                this.accLeft = false;
                break;
        }

        switch(event.keyCode) {
            case KeyCode.SPACE:
                this.isJumping = false;
                break;
        }
    }
    

    private onCollision(event: ICollisionEvent ){
        if(event.type == 'onCollisionEnter' && event.otherCollider.node.name == "Ground"){
            this.canJump = true;
            this.onTheGround =  true;
            
        }
        if(event.type == 'onCollisionStay' && event.otherCollider.node.name == "Ground"){
            this.canJump = true;
            this.onTheGround =  true;
          
        }
        if(event.type == 'onCollisionExit' && event.otherCollider.node.name == "Ground"){
            this.canJump = false;
            this.onTheGround =  false;   
        }

    }


    RunAnimation(){
        if(!this.isJumping && this.onTheGround){
          this.animate.play("Skelet.c|Running")
        }
        
    }
  
    playIdleAnimation(){
     
        if(this.onTheGround){
          this.animate.play();
        //   this.isPushing = true;
  
        }
        
    }

    JumpAnimation(){
        
        let jumpState = this.animate.getState('Skelet.c|Jumping')
        jumpState.wrapMode = AnimationClip.WrapMode.Normal
    
        
    }

    turnLeft(){
        this.RunAnimation()
       
            this.vec3.x += 0;
            this.vec3.y = -90;
            this.vec3.z += 0;
            this.quat = Quat.fromEuler(this.quat,this.vec3.x,this.vec3.y,this.vec3.z);     
            this.node.setRotation( this.quat );
            
            
        
    }

    turnRight() {
        this.RunAnimation()
        this.vec3.x += 0;
        this.vec3.y = 90;
        this.vec3.z += 0;
        this.quat = Quat.fromEuler(this.quat,this.vec3.x,this.vec3.y,this.vec3.z);     
        this.node.setRotation( this.quat );
        
        
    }   


    
    pushingBox(){
      
        // this.rigidbody.setLinearVelocity(cc.v3((2 * this.vec3.y)/100,0,0))
        if(this.isPushing){
          this.animate.play("Skelet.c|Pushing")
          this.isPushing = false;
        } 
      
        
    }



    update (deltaTime: number) {

        this.checkBox();
        
        if(this.accRight){
            this.rigidBody.setLinearVelocity(new Vec3(10, 0, 0));
        }

        if(this.accLeft){
            this.rigidBody.setLinearVelocity(new Vec3(-10, 0, 0));
        }
        if(!this.accRight && !this.accLeft){
            
            this.rigidBody.setLinearVelocity(new Vec3(0, 0, 0));
        }

        if(this.isJumping && this.onTheGround){
            let xSpeed = 0
            this.rigidBody.applyForce( new Vec3(xSpeed,100,0))
            // this.onTheGround = false;
          }

        
    }

    checkBox(){ 

 
    let p1 = this.node.position
      let ray =  geometry.Ray.create(p1.x, p1.y + 1,  p1.z, this.vec3.y,  0, 0);
      let maxDistance = 1;
      var manager =  PhysicsSystem.instance;
      if(manager.raycastClosest(ray,this.mask, maxDistance,this.queryTrigger)){
        const r = PhysicsSystem.instance.raycastClosestResult;
        if(r != null){
             var collider1node =  r.collider;
                console.log(r)
            if(collider1node.node.name == "Box"){
                if(this.vec3.y > 0){
                    this.boxRight = true;
                    this.isNextBox = true;
                    this.boxLeft = false;
                    return;
                }else if (this.vec3.y < 0){
                    this.boxLeft = true;
                    this.isNextBox = true;
                    this.boxRight = false;
                    return;
                }
            
              }
            
        }
      }

    }


    
}
