# 刘跃龙 angular 学习笔记

## 生成项目

```cmd
$ ng new AngularTest
? Would you like to add Angular routing? Yes
? Which stylesheet format would you like to use? SCSS   [ https://sass-lang.com/documentation/syntax#scss                ]
CREATE AngularTest/README.md (1028 bytes)
CREATE AngularTest/.editorconfig (274 bytes)
CREATE AngularTest/.gitignore (631 bytes)
CREATE AngularTest/angular.json (3694 bytes)
CREATE AngularTest/package.json (1254 bytes)
CREATE AngularTest/tsconfig.json (489 bytes)
CREATE AngularTest/tslint.json (3125 bytes)
CREATE AngularTest/browserslist (429 bytes)
CREATE AngularTest/karma.conf.js (1023 bytes)
CREATE AngularTest/tsconfig.app.json (210 bytes)
CREATE AngularTest/tsconfig.spec.json (270 bytes)
CREATE AngularTest/src/favicon.ico (948 bytes)
CREATE AngularTest/src/index.html (297 bytes)
CREATE AngularTest/src/main.ts (372 bytes)
CREATE AngularTest/src/polyfills.ts (2835 bytes)
CREATE AngularTest/src/styles.scss (80 bytes)
CREATE AngularTest/src/test.ts (753 bytes)
CREATE AngularTest/src/assets/.gitkeep (0 bytes)
CREATE AngularTest/src/environments/environment.prod.ts (51 bytes)
CREATE AngularTest/src/environments/environment.ts (662 bytes)
CREATE AngularTest/src/app/app-routing.module.ts (246 bytes)
CREATE AngularTest/src/app/app.module.ts (393 bytes)
CREATE AngularTest/src/app/app.component.scss (0 bytes)
CREATE AngularTest/src/app/app.component.html (25757 bytes)
CREATE AngularTest/src/app/app.component.spec.ts (1074 bytes)
CREATE AngularTest/src/app/app.component.ts (216 bytes)
CREATE AngularTest/e2e/protractor.conf.js (808 bytes)
CREATE AngularTest/e2e/tsconfig.json (214 bytes)
CREATE AngularTest/e2e/src/app.e2e-spec.ts (644 bytes)
CREATE AngularTest/e2e/src/app.po.ts (301 bytes)
✔ Packages installed successfully.
    Directory is already under version control. Skipping initialization of git.
```

## 生成模块

```doc
ng generate module <name> [options]
```

```cmd
$ ng generate module WorkerTest
CREATE src/app/worker-test/worker-test.module.ts (196 bytes)
```

## 生成组件

```doc
ng generate component <name> [options]

--skipTests=true|false 不生成.spec.ts
```

```cmd
$ ng generate component WorkerTest --skipTests=true
CREATE src/app/worker-test/worker-test.component.scss (0 bytes)
CREATE src/app/worker-test/worker-test.component.html (26 bytes)
CREATE src/app/worker-test/worker-test.component.ts (295 bytes)
UPDATE src/app/app.module.ts (494 bytes)
```

## 生成 Worker

```doc
webWorker
ng generate webWorker <name> [options]
ng g webWorker <name> [options]
Creates a new generic web worker definition in the given or default project.
在给定项目或默认项目中创建新的通用web worker定义。

<name>
The name of the worker. web worker的名字

--project=project
  The name of the project.
  项目名称

--snippet=true|false 默认值： true
  Add a worker creation snippet in a sibling file of the same name.
  在同名的同级文件中添加辅助进程创建代码段

--target=target 默认值： build
  The target to apply web worker to.
  要应用web worker的目标。
```

```cmd
ng generate webWorker worker-test/WorkerTest
```

## 生成服务

```doc
ng generate service <name> [options]

--skipTests=true|false 不生成.spec.ts
```

```cmd
ng generate service components/h265-player-test/player --skipTests=true
```

## 生成类

```doc
ng generate class <name> [options]

--skipTests=true|false 不生成.spec.ts
```

```cmd
ng generate class components/h265-player-test/PCM-Player --skipTests=true
ng generate class components/h265-player-test/WebGL-Player --skipTests=true
ng generate class components/h265-player-test/WebGL-Texture --skipTests=true
```

## 钩子

```ts
@Component({
  selector: 'XXXXX',
  templateUrl: 'XXXXX',
  styleUrls: ['XXXXX']
})
export class XXXXX implements OnInit, OnDestroy

ngOnInit(): void {
    this.runWorker();
}
ngOnDestroy(): void {
    this.stopWorker();
}
```
