(function (window) {
    // 获取元素css属性
    function getEleStyle(ele, style) {
        return getComputedStyle(ele)[style];
    }
    // 敌人对象
    class Enemy {
        constructor() {
            // 人物列表，用来存放存活的人物
            this.roles = [];
            this.roleId = 0;
            this.gameWindow = document.getElementById("gameWindow");
            // 存放人物图片
            this.rolesImage = ['xiu1', 'xiu2', 'xiu3'];
        }

        // x,y为初始位置，size为初始大小，anTime为死亡动画播放时长
        createElement(x, y, size, anTime) {
            let img = document.createElement("img");

            img.style.left = x + 'px';
            img.style.top = y + 'px';
            img.style.height = size + 'px';
            img.style.width = size + 'px';
            // 随机人物图片
            img.setAttribute('src', 'Image/'+
                this.rolesImage[Math.round(Math.random()*2)]+'.png');
            img.setAttribute('class', 'roles');

            // 添加id标签
            img.setAttribute('roleId', this.roleId);
            // 给每个人物添加死亡方法，因为click实际可以获取到元素信息
            // 所以可以通过这种方法在页面和列表删除人物
            // onclick事件产生的this是被点击的元素，所以要间接引用对象

            // 注意这里，onclick事件绑定给了Enemy对象的destroyDead方法
            // 所以实际上处理img的onclick事件的方法是destroyDead，而
            // destroyDead方法中又能获取点击事件，所以相当于省去了很多操作
            // 但是这里call才是解决问题的关键，如果不用call，那么onclick
            // 事件的this指向的就是被点击元素，而call将this指向了Enemy对象中的
            // destroyDead方法

            // 我谔谔，最后还是改变this指向成功了，不明白为什么一开始一直想把that当成参数
            // 传进去
            let that = this;
            img.onclick = function(event) {
                that.destroyDead(event, anTime);
            };
            this.gameWindow.appendChild(img);
            // 生成所需img标签
            return img;
        }

        // 生成人物，speed：移动速度,anTime：死亡动画持续时长
        spawn(speed, anTime) {
            let person = {};
            // 暂定人物的left初始为0，top随机
            person['x'] = 0;
            // 从0~当前窗口大小随机生成
            person['y'] = Math.ceil(Math.random()*document.body.clientHeight);
            // 随机生成人物移动速度
            person['speed'] = Math.ceil(1 + Math.random()*3);
            // 随机人物大小
            person['size'] = Math.ceil(50 + Math.random()*150);
            // 生成img标签
            person['element'] = this.createElement(person['x'], person['y'], person['size'], anTime);
            // 标记id，因为标记获取到的是个string，所以这里也将其转为string
            // 标签里的字符串似乎不能有特殊字符（下划线等），这里换了
            person['roleId'] = this.roleId + "";
            this.roleId += 1;
            // 添加人物
            this.roles.push(person);
            // 移动元素
            this.move(speed);
        }

        // 消除出界人物的方法，大致是设置一个定时器遍历人物列表
        // 清除走出了屏幕的人物
        destroyOut(person) {
            // 清除出界元素
            for (let i = 0; i < this.roles.length; i++) {
                if (person['roleId'] === this.roles[i]['roleId']) {
                    // 列表清除
                    // 我谔谔，这里居然splice方法居然写成了slice()切片方法...
                    this.roles.splice(i, 1);
                    // 界面清除
                    this.gameWindow.removeChild(person['element']);
                    break;
                }
            }
        }

        // 更新元素位置的方法
        updatePosition(person) {
            let ele = person['element'];
            let left = parseFloat(getEleStyle(ele, 'left')) + person['speed'];
            // 如果元素出界将其移除，否则继续位移
            if (left > document.body.clientWidth) {
                this.destroyOut(person);
            } else {
                ele.style.left = left + 'px';
            }
        }

        // 人物移动方法，time为更新速度
        // 暂定使用一个定时器循环添加增量
        move(speed) {
            this.moveTimer = setInterval(()=>{
                // 更新位置，同时判断元素是否出界
                // 注意这里传了个this，不传this会出现无法调用类方法的情况
                this.roles.forEach(this.updatePosition, this);
            }, speed);
        }

        // 展示人物死亡特效的方法
        playDeadAnimate(element) {
            // 换图
            element.setAttribute('src', 'Image/dead.png');
        }

        // 清除被击杀的人物
        destroyDead(event, anTime) {
            // 主要的思路是通过一个自定标签标识添加的元素，删除时返回这个元素
            // 该标签的值，然后在人物列表中遍历查找
            // 注意event里存放了元素，以及元素信息，所以其用一个标签标识人物
            // 列表删除就根据这个标签的value来，界面删除可以用event里的信息，
            // 也可以用其在该对象里存放的信息
            // 这里的逻辑基本和出界消除一样，但是没办法通过标签value获取列表中
            // 的person对象（可以，但没必要），所以再写一遍
            // 注意调用call方法时

            let r_id = event['target']['attributes']['roleId']['value'];
            // console.log(r_id);
            for (let i = 0; i < this.roles.length; i++) {
                if (this.roles[i]['roleId'] === r_id) {
                    // 这里设置下人物死亡的特效，或许就是换个图
                    this.playDeadAnimate(this.roles[i]['element']);
                    // 播放完了界面删除角色并删除列表角色，这里之所以这样写是因为先删除
                    // 列表角色会导致下标不正确，自然而然页面角色也就会删除错误
                    setTimeout(()=>{
                        this.gameWindow.removeChild(this.roles[i]['element']);
                        this.roles.splice(i, 1);
                    }, anTime);
                }
            }
        }

        // 整合方法方便调用
        // speed:移动速度，anTime:死亡动画持续时间，maxEnemyCnt:最多存活人物，spawnTime:生成人物间隔
        start(speed, anTime, maxEnemyCnt, spawnTime) {
            let that = this;
            this.spawnTimer = setInterval(function () {
                // 设置出场人物上限
                if (that.roles.length < maxEnemyCnt) that.spawn(speed, anTime);
            }, spawnTime);
        }

        // 退出方法，主要是清除两个无限定时器
        quick() {
            clearInterval(this.moveTimer);
            clearInterval(this.spawnTimer);
        }
    }

    // 淡出元素，ele元素,f频率,time时间，单位毫秒
    function fadeOut(ele, f, time) {
        let cur_op = getEleStyle(ele, "opacity");
        for (let i = 0; i < f; i++) {
            setTimeout(function () {
                cur_op -= 1 / f;
                ele.style.opacity = cur_op + "";
                // 最后真正清除遮罩，并将其透明度改为0
                if (i === f - 1) {
                    ele.style.opacity = 0 + "";
                    ele.style.display = "none";
                }
                // 延时
            }, i * time);
        }
    }

    // 淡入元素，ele元素,f频率,time时间，单位毫秒
    function fadeIn(ele, f, time) {
        ele.style.display = "block";
        // 转成整形
        let cur_op = parseInt(getEleStyle(ele, "opacity"));
        for (let i = 0; i < f; i++) {
            setTimeout(function () {
                cur_op += 1 / f;
                ele.style.opacity = cur_op + "";
                if (i === f - 1) {
                    ele.style.opacity = 1 + "";
                }
                // 延时，JS不是单线程执行的所以不会阻塞，这里实际上是卡了个
                // 时间差
            }, i * time);
        }
    }

    // 清除遮罩
    function clearMask(f, time) {
        let mask_board = document.getElementById("mask_board");
        fadeOut(mask_board, f, time);
    }

    // 展示遮罩
    function showMask(f, time) {
        let mask_board = document.getElementById("mask_board");
        fadeIn(mask_board, f, time);
    }

    // 转场的淡入淡出效果
    function fadeInOut(f, time) {
        showMask(f, time);
        setTimeout(function () {
            clearMask(f, time);
        }, f * time);
    }

    // 设置拟态框文字
    function setModalBoxText(title, text) {
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("modalText").innerText = text;
    }

    // 隐藏选项界面
    function hideSelection() {
        let s = document.getElementById("selection_box");
        s.style.display =  "none";
    }

    // 枪移动，射击，弹坑等
    // bulletHoleCnt：允许存在多少个弹坑
    function gunMove(bulletHoleCnt) {
        let gun = document.getElementById("gun");
        let backGround = document.getElementById("gameWindow");
        let pointer = document.getElementById("pointer");
        backGround.style.display = 'block';
        gun.style.display = 'block';
        pointer.style.display = 'block';
        window.onmousemove = function (event) {
            let left = event.clientX;
            let top = event.clientY;
            // 枪只能左右移动
            if (left < (document.body.clientWidth - parseFloat(getComputedStyle(gun)['width']))) {
                gun.style.left = left + "px";
            }
            // 指针可以任意移动
            if (top < (document.body.clientHeight - parseFloat(getComputedStyle(pointer)['height']))) {
                pointer.style.top = top + "px";
            }
            if (left < (document.body.clientWidth - parseFloat(getComputedStyle(pointer)['width']))) {
                pointer.style.left = left + "px";
            }
        };
        // 这里池沼了，在调试时发现数组长度没有增加，一瞬以为是计时器的问题
        // 然而其把数组在onmousedown这个函数里初始化了，也就是说每点击一下
        // 鼠标都会产生一个新的数组，长度自然不会改变（无能)
        let bulletHoles = [];
        window.onmousedown = function (event) {
            gun.style.backgroundImage = "url('Image/gun2.png')";
            setTimeout(() => {
                gun.style.backgroundImage = "url('Image/gun1.png')";
                // 清除弹坑
                if (bulletHoles.length !== bulletHoleCnt) {
                    // 添加弹坑
                    let temp = drawBulletHole(event.clientX + 15, event.clientY + 15);
                    bulletHoles.push(temp);
                } else {
                    // 清除最早出现的子弹坑
                    clearBulletHole(bulletHoles.shift());
                    // 再添加当前这个弹坑
                    let temp = drawBulletHole(event.clientX + 15, event.clientY + 15);
                    bulletHoles.push(temp);
                }
            }, 70);
        }
    }

    // 显示弹坑以及清除弹坑
    function drawBulletHole(left, top) {
        let gameWindow = document.getElementById("gameWindow");
        let img = document.createElement("img");
        // 生成1到3的随机数来作为弹坑图片的文件名
        let imgName = Math.ceil(Math.random()*3);
        // img.style.backgroundImage = "url()";
        img.setAttribute("class", "bullet_hole");
        img.setAttribute("src", "");
        img.style.top = top + "px";
        img.style.left = left + "px";
        // 注意这里如果要动态添加img元素的src如果为空或者不存在会导致一个白框(chrome下）
        // 所以不能用设置背景的形式设置弹坑了
        img.setAttribute("src", "Image/bullet_hole"+ imgName +".png");
        gameWindow.appendChild(img);
        return img;
    }
    function clearBulletHole(ele) {
        // 清除弹坑
        let gameWindow = document.getElementById("gameWindow");
        gameWindow.removeChild(ele);
    }

    // 开始游戏
    function startGame(maxBulletHole = 3, speed = 20, anTime = 1500,
                       maxEnemyCnt = 10, spawnTime = 1500) {
        fadeInOut(60, 17);
        // 配合遮罩效果消除选项以及展示游戏界面
        setTimeout(function () {
            hideSelection();
            gunMove(maxBulletHole);
            // 创建敌人对象并开始敌人对象的活动
            // 敌人对象的z-index太低导致其点击不能，可能是和弹坑重叠了，但是看起来在上层
            new Enemy().start(speed, anTime, maxEnemyCnt, spawnTime);
        }, 700);
    }

    // 向外暴露自定义模块
    window.myModle = {
        clearMask,
        showMask,
        setModalBoxText,
        startGame,
    }
})(window);