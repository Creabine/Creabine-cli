#!/usr/bin/env node

const shell = require('shelljs');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const spinner = ora();
// const pkg = require('../package.json');

program.version('1.0.0', '-v, --version')
    .usage('--start')
    // .version(pkg.version)
    .option('-s, --start', '开启cli模板选择')
    .parse(process.argv);

program.on('--help', function () {
    console.log('  示例(Examples):');
    console.log();
    console.log('    le --start/-s');
});

const defaultProjectName = path.basename(path.resolve(__dirname, '..'));
const projectPath = path.resolve(__dirname, '..');

// let dir = __dirname;

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'project name:',
    default: defaultProjectName,
    validate: (name)=>{
        if(/^[a-z]+/.test(name)){
            return true;
        }else{
            return '项目名称必须以小写字母开头';
        }
    }
  },{
    type: 'input',
    name: 'version',
    message: 'version:',
    default: '1.0.0',
    validate: (name)=>{
        if(/^[0-9]|-/.test(name)){
            return true;
        }else{
            return '版本号只能包含数字和.';
        }
    }
  },{
    type: 'input',
    name: 'description',
    message: 'description:'
  },{
    type: 'input',
    name: 'keywords',
    message: 'keywords:'
  },{
    type: 'input',
    name: 'author',
    message: 'author:'
  },{
    type: 'input',
    name: 'license',
    message: 'license:',
    default: 'ISC'
  },{
      type: 'list',
      message: '请选择',
      name: 'templateType',
      choices: [
          new inquirer.Separator(' * 前端项目 * '),
          {
              name: '基于Gulp的多页jQuery',
              value: 'jquery-gulp'
          },
          new inquirer.Separator(' * 微信小程序 * '),
          {
              name: '基于Mpvue的微信小程序项目',
              value: 'mpvue'
          }
          // new inquirer.Separator(' * 后端 * '),
          // {
          //     name: '基于Egg的博客项目',
          //     value: 'egg-blog'
          // }
      ]
  }
];

inquirer.prompt(questions).then((answers)=>{
    // keywords 处理成数组
    answers.keywords = answers.keywords ? answers.keywords.split(',') : [];
    // 初始化模板文件
    downloadTemplate(answers);
})

function downloadTemplate(params){
    spinner.start('loading');
    const templateType = params.templateType;
    const downloadUrl = `github:Creabine/Creabine-cli-templates#${templateType}`;
    // 开始下载模板文件
    download(downloadUrl, projectPath, function(err){
        if(err){
            spinner.fail(err);
        };
        updateTemplateFile(params);
    });
}

function updateTemplateFile(params){
    let { name, description } = params;
    // 读取package.json
    fs.readFile(`${projectPath}/package.json`, (err, buffer)=>{
        if(err) {
            console.log(chalk.red(err));
            return false;
        }
        // 删除 git 和 CHANGELOG
        // shell.rm('-f', `${projectPath}/.git`);
        // shell.rm('-f', `${projectPath}/CHANGELOG.md`);
        let packageJson = JSON.parse(buffer);
        // params中有的就把值写进去
        Object.assign(packageJson, params);
        fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));
        // 写README
        fs.writeFileSync(`${projectPath}/README.md`, `# ${name}\n\n> ${description}`);
        spinner.succeed('创建完毕');
    });
}
