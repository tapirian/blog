---
date: 2020-09-27
title: 几种常见的设计模式的PHP实现
category: PHP 
tags:
- PHP
- 设计模式
---

# 几种常见的设计模式的PHP实现

## 一、工厂模式
**工厂方法或者类生成对象，而不是在代码中直接new**

优点：生成的对象如果需要变化，只需要在类里面进行修改。避免多个地方生成对象，都需要对生成对象的参数修改。

核心代码：

```php
<?php
namespace TT

class Factory{
	function createDataBase()
	{
		$db = new Database;
		return $db;	
	}
}
```

## 二、单例模式
**使一个类只能实例化一次。**

优点：避免多次实例化造成对资源的浪费。

核心代码：

```php
<?php
namespace TT

class Database
{
	protected $db;
	// 构造方法私有化，不让类文件以外的地方去实例化
	private function __construct()
	{
	
	}
	
	static function getInstance()
	{
		if(self::$db) {
			return self::$db;
		} else {
			self::$db = new self();
			return self::$db;
		}
	}
}
```

## 三、注册器模式
**全局共享和交换对象**
   
优点：将对象注册到全局的树上，使用的时候，可以直接获取。   
核心代码：

```php
<?php
namespace TT

class Register()
{
	protected static $objects;
	function set($alias, $object)
	{
		self::$objects[$alias] = $object;
	}
	
	function _unset($alias)
	{
		unset(self::$objects[$alias]);
	}
	
	function get($alias) 
	{
		return self::$objects[$alias];
	}
}	
```

## 四、适配器模式
适配器模式，首先需要创建一个标准的接口，然后再去创建需要实现的类来实现这个接口。这样，就可以适配更多的环境来实现我们的需求。

优点：可以将截然不同的函数接口封装成统一的API。

实际应用：将三种不同的数据库操作接口封装成统一的接口。

示例代码:
1. 首先先建立一个标准的api：Database.php
```php
<?php
namespace TT
interface IDatabase
{
	function connect($host, $user, $passwd, $dbname);
	function query($sql);
	function close();
}	
```
2.MySQL数据库操作类：MySQL.php

```php
<?php
namespace TT\Database

use TT\IDatabase;
class MySQL implements IDatabase 
{
	protected $conn;
	function connect($host, $user, $passwd, $dbname)
	{
		$conn = mysql_connect($host, $user, $passwd);
		mysql_select_db($dbname, $conn);
		$this->conn = $conn;
	} 
	
	function query($sql)
	{
		return mysql_query($sql, $this->conn);
	} 
	
	function close()
	{
		mysql_close($this->conn);
	}
}
```

3.MySQLi数据库操作类：MySQLi.php
```php
<?php
namespace TT\Database

use TT\IDatabase;
class MySQLi implements IDatabase 
{
	protected $conn;
	function connect($host, $user, $passwd, $dbname)
	{
		$conn = mysqli_connect($host, $user, $passwd, $dbname);
		$this->conn = $conn;
	} 
	
	function query($sql)
	{
		return mysqli_query($this->conn, $sql);
	} 
	
	function close()
	{
		mysqli_close($this->conn);
	}
}
```

4.PDO数据库操作类：PDO.php
```php
<?php
namespace TT\Database

use TT\IDatabase;
class PDO implements IDatabase 
{
	protected $conn;
	function connect($host, $user, $passwd, $dbname)
	{
		$conn = new \PDO("mysql:host=$host;dbname=$dbname", $user, $passwd);
		$this->conn = $conn;
	} 
	
	function query($sql)
	{
		return $this->conn->query($sql);
	} 
	
	function close()
	{
		unset($this->conn);
	}
}
```

4. 调用

```php
<?php
$db = new TT\Database\MySQL();
$db->connect('127.0.0.1', 'root', 'root', 'test');
$db->query("show databases");
$db->close();
```

## 五、策略模式
**策略模式，就是将一组特定的行为和算法封装成类，以适应某些特定的上下文环境。**

实际应用：电商网站根据性别展示不同的类目和广告

示例代码：

1. 定义一个标准的接口
```php
<?php
namespace TT;

interface UserStrategy()
{
	function showAd();
	function showCategary();
}
```

2. 策略一：女性用户
```php
<?php
namespace TT;

class FemaleUserStrategy implements UserStrategy()
{
	function showAd()
	{
		echo "包包";
	}
	function showCategary()
	{
		echo "服装";
	}
}
```


3. 策略二：男性用户
```php
<?php
namespace TT;

class MaleUserStrategy implements UserStrategy()
{
	function showAd()
	{
		echo "华为P80";
	}
	function showCategary()
	{
		echo "电子产品";
	}
}
```


4. 实现
```php
<?php

class page
{
	protected $strategy;
	function index()
	{
		$this->strategy->showAd();
		$this->strategy->showCategory();
	}
	
	function setStrategy(TT\UserStrategy, $strategy)
	{
		$this->strategy = $strategy;
	}
}

$page = new Page();

if (isset($_GET['Male'])) {
	$strategy = new TT\MaleUserStrategy(); 
} else {
	$strategy = new TT\FemaleUserStrategy();
}

$page->setStrategy($strategy);
$page->index();
```

策略模式实现了依赖倒置和控制反转。
上边实现的类page，使用了策略模式，通过接口设置的解耦，将依赖关系进行了倒置。只有在执行的过程中进行了关系的绑定。

## 六、数据对象映射模式
**将数据和对象存储起来，对一个对象的操作会映射为对数据存储的操作**

实际应用：数据表user，对数据的操作。

核心代码

1. user数据表类文件
```php
<?php
namespace TT;

class User
{
	public $id;
	public $name;
	public $phone;
	
	protected $db;
	
	function __construct($id)
	{
		$this->db = new \TT\Database\MySQLi();
		$this->db->connect('127.0.0.1', 'root', 'root', 'test');
		$res = $this->db->query("select * from user where id={$id} limit 1");
		$data = $res->fetch_assoc();
		$this->id = $data['id'];
		$this->name = $data['name'];
		$this->phone = $data['phone'];
	}
	function __destruct()
	{
		$this->db->query("update user set name='{$this->name}', phone='{$this->phone}' where id={$this->id}");
	}
}
```
2. 实现

```php
<?php

$user = new TT\User(1);
$user->phone = '15998776577';
$uesr->name = '张三';
```

## 七、观察者模式
观察者模式(Observer)，当一个对象状态发生变化时，依赖它的对象全部会收到通知，并自动更新。 

观察者模式实现了低耦合，非侵入式的通知与更新机制。

场景： 
一个事件发生后，要执行一连串更新操作。传统的编程方式，就是在事件的代码之后直接加入处理的逻辑。当更新的逻辑增多之后，代码会变得难以维护。这种方式是耦合的，侵入式的，增加新的逻辑需要修改事件的主体代码。 

实现代码：
```php
<?php
class Event extends \TT\EventGenerator;
{
	function trigger()
	{
		$this->notify();
	}
}

$event = new Event();
$event->addObserver(new Observer1);
$event->addObserver(new Observer2);
$event->trigger();
```


```php
<?php
namespace TT;

abstract class EventGenerator
{
	protected $observers = [];
	function addObserver(Observer $observer)
	{
		$this->observers[] = $observer;
	}

	function notify()
	{
		foreach($this->observers as $observer)
		{
			$observer->upadte();
		}
	}
}
```



```php
<?php
namespace TT;

interface Observer
{
	function update($event_info = null);
}
```

```php
<?php
namespace TT;

class Observer1 implements \TT\Observer
{
	function update($event_info = null)
	{
		echo '逻辑1';
	}
}
```

## 八、原型模式
与工厂模式作用类似，都是用来创建对象。

与工厂模式的实现不同，原型模式是先创建一个原型对象，然后通过clone原型对象来创建新的对象，这样就免去了类创建时重复的初始化操作

原型模式适用于大对象的创建。创建一个大对象需要很大的开销，如果每次new就会消耗很大，原型模式仅需内存拷贝即可

示例代码：
```php
$prototype = new TT\Canvas();
$prototype->init();

$canvas1 = clone $prototype;
$canvas1->rect(3, 6, 4, 12);
$canvas1->draw();

$canvas2 = clone $prototype;
$canvas2 ->rect(1, 3, 2, 6);
$canvas2 ->draw();

```

## 九、装饰器模式
装饰器模式，可以动态地添加修改类的功能。

一个类提供了一项功能，如果要在修改并添加额外的功能，传统的编程模式，需要写一个子类继承它，并重新实现类的方法,使用装饰器模式，仅需在运行时添加一个装饰器对象即可实现，可以实现最大的灵活性。

示例代码：
1. 声明一个装饰器的接口
```php
<?php
namespace TT;

interface DrawDecorator
{
	function beforeDraw();
	function afterDraw();
}
```
2. 画布
```php
<?php
namespace TT;

class Canvas
{
	protected $decorators;
	function addDecorator(DrawDecorator; $decorator)
	{
		$this->decorators[] = $decorator;
	}
	
	function draw()
	{
		$this->beforeDraw();
		// draw
		$this->afterDraw();
	}
	
	function beforeDraw()
	{
		foreach($this->decorators as $decorator) 
		{
			$decorator->beforeDraw();
		}
	}
	
	function afterDraw()
	{
		// 反转，后进先出
		$decorators  = array_reverse($this->decorators);
		foreach($decorators as $decorator) 
		{
			$decorator->afterDraw();
		}
	}
}
```

3. 装饰器实现代码

```php
namespace TT;

class ColorDrawDecorator implements DrawDecorator
{
	protected $color;
	function __construct($color = 'red')
	{
		$this->color = $color;
	}
	
	function beforeDraw()
	{
		echo "<div style='color: {$this->color};'>";
	}
	
	function afterDraw()
	{
		echo "</div>";
	}
}
```

4. 调用
```php
<?php
$canvas1 = new TT\Canvas();
$canvas1->init();
$canvas1->addDeCorator(new \TT\ColorDrawDecorator('green'));
$canvas1->rect(2, 6, 4, 12);
$canvas1->draw();
```

## 十、迭代器模式

1. 迭代器模式，在不需要了解内部实现的情况下，遍历一个聚合对象的内部元素。
2. 相对于传统的编程模式，迭代器模式可以隐藏遍历元素所需要的操作。

示例代码：
```php
<?php
namespace TT;

class AllUser implements \Iterator
{
	protected $ids;
	protected $index;
	protected $data = [];
	function __construct
	{
		$db = Factory::getDatabase();
		$result = $db->query("select id from user");
		$this->ids = $result->fetch_all(MYSQLI_ASSOC);
	}

	// 第三步：拿到当前数据
	function current()
	{
		$id = $this->ids[$this->index]['id'];
		return Factory::getUser($id);
	}
	
	// 第四步：索引向下移动
	function next()
	{
		$this->index ++;
	}
	
	// 第二步：验证当前是否有数据
	function valid()
	{
		return count($this->ids) > $this->index;
	}
	
	// 第一步：重置
	function rewind()
	{
		$this->index = 0;
	}
	
	// 获取当前索引
	function key()
	{
		return $this->index;
	}
}
```

```php
<?php
$users = new \TT\AllUser();
foreach($users as $user)
{
	var_dump($user->name);
}
```

迭代器的类继承一个php标准类库的迭代器接口Iterator，里面一共包含了5个方法。只要实现了这5个方法，就可以在最外面进行foreach循环，就可以获取到对应的数据。

## 十一、代理模式
1. 在客户端与实体之间建立一个代理对象，客户端对实体进行操作全部委派给代理对象，隐藏实体的具体实现细节。
2. 代理对象害可以与业务代码分离，部署到另外的服务器。业务代码中通过RPC来委派任务。

示例代码：
1. 传统编程
```php
<?php
$db = \TT\Factory::getDatabase('slave');
$info = $db->query("select name from user where id=1 limit 1");

$db = \TT\Factory::getDatabase('master');
$info = $db->query("update user set name='lili' where id=1 limit 1");
```

2. 代理模式
```php
<?php
namespace TT;

interface IUserProxy
{
	function getUserName($id);
	function setUserName($id, $name);
}
```
```php
<?php
namespace TT;

class Proxy implements IUserProxy
{
	function getUserName($id)
	{
		$db = \TT\Factory::getDatabase('slave');
		$info = $db->query("select name from user where id=1 limit 1");
	}
	function setUserName($id, $name)
	{
		$db = \TT\Factory::getDatabase('master');
$info = $db->query("update user set name='$name' where id=1 limit 1");
	}
}
```

## 实战
### 1.自动加载配置
实现效果：
从文件中以数组的方式加载配置项，配置文件中定义一个数组，并返回它。

实现代码：
Config.php
```php
class Config implements \ArrayAccess
{
	protected $path;
	protected $configs = [];
	function __construct($path)
	{
		$this->path = $path;
	}
	
	function offsetGet($key) 
	{
		if (empty($this->configs[$key])) {
			$file_path = $this->path . '/' . $key . '.php';
			$config = require $file_path;
			$this->configs[$key] = $config;
			return $this->configs[$key];
		}
	}
	
	function offsetSet($key) 
	{
	}
	
	function offsetExists($key) 
	{
	}
	
	function offsetUnset($key) 
	{
	}
}	
```
调用：
```php
$config = new \TT\Config(__DIR__ . 'configs');
var_dump($config['controller']); // 调用controller的配置
```

### 2. 从配置中生成数据库连接
示例代码：

数据库配置示例：
```php
<?php
return [
	'master' = [
		'host' => '',
		'user' => '',
		'password' => '',
		'dbname' => '',
	],
	'slave' = [
		'slave1' = [
			'host' => '',
			'user' => '',
			'password' => '',
			'dbname' => '',
		],
		'slave2' = [
			'host' => '',
			'user' => '',
			'password' => '',
			'dbname' => '',
		],
	],
];
```

使用配置连接示例：
```php
static function getDatabase($id = 'master')
{
	$key = 'database_' . $id;
	if ($id == 'slave') {
		$slaves = Application::getInstance()->config['database']['slave'];
		$db_config = $slaves[array_rand($slaves)];
	} else {
		$db_config = Application::getInstance()->config['database'][$id];
	}
	$db = Register::get($key);
	if (!$db) {
		$db = new Database\MySQLi();
		$db->connect($db_conf['host'], $db_conf['user'], $db_conf['password'], $db_conf['dbname']);
		Register::set($key, $db);
	}
	return $db;
} 
```

### 3. 装饰器模式在MVC架构中的使用
场景：
控制器中的一个方法，我们根据不同的配置，让返回的数据以json格式显示，或者直接输出到模板。

装饰器核心代码：
Template.php
```php
protected $controller;

function beforeRequest($controller)
{
	$this->controller = $controller;
}

function afterRequest($return_value)
{
	if ($_GET['app'] == 'html') {
		foreach ($return_value as $k => $v) 
		{
			$this->controller->assign($k, $v);
		}
		$this->controller->display();
		return;
	}
	
}
```
Json.php
```php
protected $controller;

function beforeRequest($controller)
{
	$this->controller = $controller;
}

function afterRequest($return_value)
{
	if ($_GET['app'] == 'json') {
		return json_encode($return_value);
	}
	
}
```

实现代码：
```php
class Home extends Controller
{
	function index()
	{
		$model = Factory::getModel('User');
		$userid = $model->create(['name' => '张三', 'phone' => '15998589988']);
		return ['user_id' => $userid, 'name' => '王哈哈'];	
	}
}
```

### 4. 观察者模式在MVC架构中的使用
模拟一个场景，一个新员工入职，不同部门需要有不同的工作需要处理。

控制器层：

```php
class Index extends Controller
{
	// 传统模式：
	public function index()
	{
		$model = Factory::getModel('user');
		$model->create(['name' => 'zhangsan', 'sex' => '男']);
		// case1 : 行政：分配工位
		// case2 : HR：注册社保
		// case3 : IT：分配电脑
	}
}
```

模型层：
```php
class User extends Model
{
	public function create($user)
	{
		$userId = 1;
		$this->notify($user);
		return $userId;
	}
}
```

配置层：
```php
return [
	'user' => [
		// 三个观察者，分别对应不同部门的职责
		'observer' => [
			'App\observer\UserAdd1',
			'App\observer\UserAdd2',
			'App\observer\UserAdd3',
		],
	],
];
```

观察者：
App\observer\UserAdd、App\observer\UserAdd2、App\observer\UserAdd3
```php
<?php
namespace App\observer;

class UserAdd1()
{
	function update($id)
	{
		echo "分配工位<br/>";
	}
}

```
```php
<?php
namespace App\observer;

class UserAdd2()
{
	function update($id)
	{
		echo "注册社保<br/>";
	}
}

```
```php
<?php
namespace App\observer;

class UserAdd3()
{
	function update($id)
	{
		echo "分配电脑<br/>";
	}
}

```

如果需要新的部门，实现新的部门职能，只需要再新增一个观察者。如果某个部门的职能不需要了，只需要注释掉配置中的对应的观察者就可以了。


### 5. 代理模式在MVC架构中的使用
我们仍然做一个数据读写分离的示例。

示例代码：

```php
<?php
namespace Database;

use TT\Factory;

class Proxy()
{
	function query($sql)
	{
		if(substr($sql, 0, 6) == 'select') {
			echo "读操作：" . $sql . "<br />";
			return Factory::getDatabase('slave')::query($sql);
		} else {
			echo "写操作：" . $sql . "<br />";
			return Factory::getDatabase('master')::query($sql);
		}
	}
}
```

执行一下：
```php
$db = Factory::getDatabase();
$db->query("select * from user limit 1");
$db->query("delect from user where id = 1");
$db->query("update user set name='zhangsan' where id = 1");
```

## 总结
### 面向对象编程的基本原则
1. 单一职责：一个类，只需要做好一件事情。
2. 开放封闭：一个类，应该是可扩展的，而不可修改的。
3. 依赖倒置：一个类，不应该强依赖另外一个类，每个类对于另外一个类都是可替换的。
4. 配置化：尽可能地使用配置，而不是硬编码。
5. 面向接口编程，而不需要关心具体实现。

### MVC结构
模型-视图-控制器，一种C/S或者B/S软件工程地组织方式
 - 模型（Model）：数据和存储的封装
 - 视图（View）：展现层的封装，如Web系统中的模板文件
 - 控制器（Controller）：逻辑层的封装
  
 ## 参考
 - [PHP中使用ArrayAccess实现配置文件的加载](https://blog.csdn.net/qq_39545346/article/details/108863445)
 - [在工厂方法中读取配置，生成可配置化的对象](https://blog.csdn.net/qq_39545346/article/details/108863493)
 - [使用装饰器模式实现权限验证，模板渲染，JSON串化](https://blog.csdn.net/qq_39545346/article/details/108863569)
 - [使用观察者模式实现数据更新事件的一系列更新操作](https://blog.csdn.net/qq_39545346/article/details/108863591)
 - [使用代理模式实现数据库的主从自动切换](https://blog.csdn.net/qq_39545346/article/details/108863624)

