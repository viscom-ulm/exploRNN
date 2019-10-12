export class Network {

    constructor(s) {
        this.s = s;
        this.layers = []
        let layercount = s.network.length
        let nodes = s.network[0]
        this.layers.push(new Layer(s, layercount, -1, nodes));
        for(let i = 1; i < layercount - 1; i++) {
            nodes = s.network[i]
            this.layers.push(new Layer(s, layercount, i, nodes));
        }
        nodes = s.network[layercount-1]
        this.layers.push(new Layer(s, layercount, -1, nodes));
    }

    draw() {
        this.s.strokeWeight(2 * this.s.netScale);

        this.s.stroke(255);
        this.s.noFill();
        this.s.line(0, this.s.height/2, this.s.width, this.s.height/2);
        for(let l of this.layers) {
            l.draw();
        }
    }

    update(x, y) {
        //console.log('UPDATE',x ,y )
        for(let l of this.layers) {
            l.update(x,y)
        }
    }

    checkClick() {
        for(let l of this.layers) {
            l.checkClick()
        }
    }
}

class Layer {

    constructor(s, layers, i, nodes) {
        this.s = s;
        this.i = i;
        this.layers = layers - 2;
        this.layerwidth = nodes.size
        this.nodes = []
        this.layerType = nodes.type;
        this.hover = false;
        this.clicked = false;
        this.x = s.width * (this.i)/(this.layers + 1);
        this.y = s.height/2;
        this.w = s.width/(2*this.layers + 1);
        this.h = this.w * 0.8
        /*
        for(let j = 0; j < this.layerwidth; j++) {
            this.nodes.push(new Node(s, s.width * (i+1)/(this.layers), s.height * (j + 1)/ (nodes.size+1), 50, nodes.type))
        }
        */
    }

    draw() {
        if(!(this.layerType === 'input' || this.layerType === 'output')) {
            let s = this.s;
            s.fill(45, this.s.netAlpha);
            s.stroke(225, this.s.netAlpha);
            if(this.hover){
                s.stroke(150,180,250, this.s.netAlpha);
                s.cursor(s.HAND)
            }
            s.rect(this.x,this.y,this.w,this.h);
            s.noStroke();
            s.fill(180);
            let left = this.x - this.w/2;
            let top = this.y - this.h/2;
            for(let i = 0; i < 5; i++) {
                s.ellipse(left + (i+1) * this.w / 6, top + this.h / 3, this.w / (i === 0 || i === 2 ? 20 : 10))
            }
            s.rect(left + (3) * this.w / 6, top + 2 * this.h / 3, this.w / (10),this.w / (10))
            if(this.hover) {
                s.textAlign(s.CENTER, s.CENTER);
                s.fill(0,150)
                s.rect(s.mouseX, s.mouseY+40, 100, 30);
                s.fill(255)
                s.text('Click for detail', s.mouseX, s.mouseY + 40)
            }
        }
        /*
        for(let n of this.nodes) {
            n.draw();
        }
        */
    }

    update(x,y) {
        if(x > this.x - this.w/2 && x < this.x + this.w/2 && y > this.y - this.h/2 && y < this.y + this.h/2) {
            this.hover = true;
        } else {
            this.hover = false;
        }
    }

    checkClick() {
        if(this.hover && !this.clicked) {
           this.s.detail = true;
           this.s.clickedBlock = this;
           this.s.props.actions.stopTraining(this.s.props.training);
        }
        this.clicked = this.hover
    }
}
/*
class Node {
    constructor(s, x, y, r, type) {
        this.s = s;
        this.x = x;
        this.y = y;
        this.r = r;
        this.type = type
        this.hover = false;
        this.clicked = false;
        this.label = 'node'
        if(type === 'input')
            this.x = 0
        if(type === 'output')
            this.x = s.width
    }

    draw() {
        let s = this.s
        if(!s.update){
            s.stroke(0, s.netAlpha);
            s.fill(255, s.netAlpha);
        } else {
            s.stroke(0, s.netAlpha);
            s.fill(50,255,150, s.netAlpha);
        }
        if(this.hover) {
            s.stroke(0, s.netAlpha);
            s.fill(250,100,100, s.netAlpha);
        }
        if(this.clicked) {
            switch(this.type) {
                case 'input':
                    break;
                case 'hidden':
                    this.s.ellipse(this.x,this.y,this.r);
                    break;
                case 'output':
                    break;
                default:
            }
        } else {
            switch(this.type) {
                case 'input':
                case 'output':
                    break;
                default:
                    this.s.ellipse(this.x,this.y,this.r);
            }
        }

    }

    
}
*/