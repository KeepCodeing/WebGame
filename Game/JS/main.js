(function (window) {
    // 获取元素css属性
    function getEleStyle(ele, style) {
        return getComputedStyle(ele)[style];
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
                // 延时
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
    // 显示弹坑
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
    function startGame(maxBulletHole = 3) {
        fadeInOut(60, 17);
        // 配合遮罩效果消除选项以及展示游戏界面
        setTimeout(function () {
            hideSelection();
            gunMove(maxBulletHole);
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