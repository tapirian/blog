---
date: 2021-09-06
title: Yii2框架源码分析
category: PHP 
tags:
- PHP
---

# Yii2框架源码分析
`Yii框架`是一款优秀的PHP框架， 我们来分析一下它的源码。

## 全局辅助类Yii.php
我们在入口文件里面，已经看到引入了Yii.php，那么在这里我们把源码贴出来：

```php
<?php

require __DIR__ . '/BaseYii.php';

class Yii extends \yii\BaseYii
{
}

//Yii全局辅助类，没啥可说的。

//注册自动加载，为Yii里面的autoload方法。（当然，autoload方法存在于Yii的基类：\yii\BaseYii）
spl_autoload_register(['Yii', 'autoload'], true, true);

// 自动加载的所有类的全局树。
Yii::$classMap = require __DIR__ . '/classes.php';

// 实例化一个容器，作为当前应用的容器。
Yii::$container = new yii\di\Container();
```

首先，我们引入了辅助类的基类BaseYii.php (因为这个时候，自动加载还没注册，所以只能手动引入)，然后注册自动加载。我们接下来讲一下BaseYii.php这个类。这个类主要实现的事情有：

1. 定义一些全局常量。
2. 类的自动加载
3. 路径别名的设置和获取。
4. 创建对象并注入到当前容器。
5. 不同级别日志的记录功能。
6. 语言翻译。
7. 对象属性的初始设置。

当引入yii.php的时候，根据程序执行来看，做的事情有：定义常量和自动加载。我们这里顺便把BaseYii.php的所有支持的功能都列了出来。这里主要讲自动加载、对象的属性设置、以及创建类三个方法。

### 自动加载：
```php
public static function autoload($className)
    {
        if (isset(static::$classMap[$className])) {
            $classFile = static::$classMap[$className];
            if ($classFile[0] === '@') {
                $classFile = static::getAlias($classFile);
            }
        } elseif (strpos($className, '\\') !== false) {
            $classFile = static::getAlias('@' . str_replace('\\', '/', $className) . '.php', false);
            if ($classFile === false || !is_file($classFile)) {
                return;
            }
        } else {
            return;
        }

        include $classFile;

        if (YII_DEBUG && !class_exists($className, false) && !interface_exists($className, false) && !trait_exists($className, false)) {
            throw new UnknownClassException("Unable to find '$className' in file: $classFile. Namespace missing?");
        }
    }


public static function getAlias($alias, $throwException = true)
    {
        // 如果第一个字符不是@符号，代表不是Yii框架内部的命名空间，直接返回。
        if (strncmp($alias, '@', 1)) {
            // not an alias
            return $alias;
        }

        // 获取根命名空间
        $pos = strpos($alias, '/');
        $root = $pos === false ? $alias : substr($alias, 0, $pos);

        // 根命名空间必须提前注册到全局注册树上。如果根命名空间不存在就直接返回false
        if (isset(static::$aliases[$root])) {
            if (is_string(static::$aliases[$root])) {
                return $pos === false ? static::$aliases[$root] : static::$aliases[$root] . substr($alias, $pos);
            }


            foreach (static::$aliases[$root] as $name => $path) {
                if (strpos($alias . '/', $name . '/') === 0) {
                    return $path . substr($alias, strlen($name));
                }
            }
        }

        if ($throwException) {
            throw new InvalidArgumentException("Invalid path alias: $alias");
        }

        return false;
    }
```


首先，autoload方法已经在Yii.php中通过`spl_autoload_register()`函数注册。`autoload()`方法存在一个参数`$className`，就是完整的类名称(包含命名空间)，`$className`是php自动传入的，我们不需要做处理。

`$classMap`是`BaseYii.php`的静态属性，它是自动加载完毕的类的全局树。数组键是类名（不带前导反斜杠），数组值是对应的类文件路径。`getAlias()`用来获取真实类文件路径。

最后引入文件。

### 创建对象：

```php
public static function createObject($type, array $params = [])
    {
        // 创建对象，并将其注入当前应用的容器中。

        if (is_string($type)) {
            return static::$container->get($type, $params);
        }

        if (is_callable($type, true)) {
            return static::$container->invoke($type, $params);
        }

        if (!is_array($type)) {
            throw new InvalidConfigException('Unsupported configuration type: ' . gettype($type));
        }

        if (isset($type['__class'])) {
            $class = $type['__class'];
            unset($type['__class'], $type['class']);
            return static::$container->get($class, $params, $type);
        }

        if (isset($type['class'])) {
            $class = $type['class'];
            unset($type['class']);
            return static::$container->get($class, $params, $type);
        }

        throw new InvalidConfigException('Object configuration must be an array containing a "class" or "__class" element.');
    }
```

createObject其实就是new的增强版，他可以根据配置创建一个对象。

第一个参数`$type`支持字符串、数组、回调函数三种类型。如果type是一个数组，该数组必须包括"__class"或者"class"键。该键对应的值是需要创建的对象对应的类名称。数组里面其他的参数是这个类的属性的初始值的设置。`$params`则是该类的构造方法所需要的参数。如果type是字符串，则是一个类名称，如果是回调函数，则直接出发回调。`$params`就是回调函数所需参数。

具体创建对象的实现逻辑，我会在后面的容器章节进行讲解。

### 设置对象初始属性：

```php
public static function configure($object, $properties)
    {
        foreach ($properties as $name => $value) {
            $object->$name = $value;
        }
        return $object;
    }
```
这个方法第一个参数是需要设置属性的对象， 第二个参数是需要设置的对象的属性（键值对形式的数组）。代码及其简单，为什么单独拿出来讲呢？因为这里涉及到php魔术方法`__set()`的一个触发场景。

`__set()`当设置一个没有访问权限的属性值，或者是设置不存在的属性值的时候会触发。但是yii2源码中，为了满足编辑器的友好展示，使用注释的方式表示类的属性。（这种方式其实并没什么卵用，相当于没写）例如

```php
/**
 * @property array $prop;
 * Class A
 */
class A
{

}
```
这样可以触发`__set()`和`__get()`方法。因为属性`$prop`不存在呀。

## 容器类Container.php
​
首先，php中的容器是为了解决类和类之间的依赖关系的。举个栗子：

存在三个类：
```php
class Group
{
    public static $a = 0;

    function __construct($a)
    {
        static::$a = $a;
    }
}


class User
{
    public function __construct(Group $group)
    {

    }

}


class UserList
{
    public function __construct(User $user)
    {

    }

    public function getUserList()
    {
        echo "this is the user-list";
    }
}
```

如果我们要调用UserList类里面的getUserList()方法，通常的做法是：
```php
$group = new Group(1);
$user = new User($group);
$userList = new UserList($user);
$userList->getUserList();
```

如果我们使用容器的话，需要这样做：
```php
$container = new Container();
$container->set('Group', 'app\service\Group');
$container->set('User', 'app\service\User');
$container->set('UserList', 'app\service\UserList');
$lister = $container->get('UserList');
$lister->getUserList();
```

我们发现：我们只需要把所有的相关联的类，全部注入到容器中，不需要关心他们之间的依赖关系。（容器帮我们完成了依赖关系的处理）

怎么实现的呢？通过php的反射。

php的反射可以获取类的相关信息。那么我们首先通过

`$reflection = new \ReflectionClass($className)`获取目标类的反射类。再通过

`$reflection->getConstructor()`获取反射类的构造方法类，再通过

`$constructorParameters = $constructor->getParameters()`获取构造方法所需参数类。(是一个数组)

再通过参数类的 `isDefaultValueAvailable()` 方法判断，参数是否有可用默认值。如果没有，则断言它是一个对象，我们就创建它。具体实现看代码：

```php
<?php

namespace yii\di;

use ReflectionClass;
use Yii;
use yii\base\Component;
use yii\base\InvalidConfigException;
use yii\helpers\ArrayHelper;

class Container extends Component
{
 
    private $_singletons = [];
    
    private $_definitions = [];

    private $_params = [];

    private $_reflections = [];
   
    private $_dependencies = [];

    public function get($class, $params = [], $config = [])
    {
        // 这里是获取一个类的实例。
        //$class 第一个参数是类的名称或者别名，当然，你得先使用set()方法将改类注册到容器中，才能使用get方法获取。
        //$params 第二个参数是该类的构造方法所需要的参数，请在数组中按照顺序传入。
        //$config 第三个参数是该类中属性的初始值得设置，是键值对形式的数组。

        // Instance表示对容器中对象的引用
        // 如果获取的当前类属于instance, 唯一标识就变为当前类中的id属性。
        if ($class instanceof Instance) {
            $class = $class->id;
        }

        // singleton属性是一个容器的注册树，如果说当前实例已经存在注册树上，就直接返回。
        if (isset($this->_singletons[$class])) {
            // singleton
            return $this->_singletons[$class];
        } elseif (!isset($this->_definitions[$class])) {
            // 如果不存在定义就创建实例，并返回（创建中会将其注册到全局树上）
            return $this->build($class, $params, $config);
        }

        // 存在$definition的逻辑
        // 这个属性其实就是注册类的时候（调用set()方法），传入的第二个参数。他一共有三种类型。
        // 1.回调函数
        // 2. 数组
        // 3. 字符串。
        $definition = $this->_definitions[$class];

        if (is_callable($definition, true)) {
            // 处理参数
            $params = $this->resolveDependencies($this->mergeParams($class, $params));
            // 回调函数返回值就是当前需要的实例。
            $object = call_user_func($definition, $this, $params, $config);

        } elseif (is_array($definition)) {
            $concrete = $definition['class'];
            unset($definition['class']);
            // 先将参数合并
            $config = array_merge($definition, $config);

            // 将容器中已经注册的类参数和现在传入的参数合并。
            $params = $this->mergeParams($class, $params);
            if ($concrete === $class) {
                // 如果名称一样，就直接创建这个对象。
                $object = $this->build($class, $params, $config);
            } else {
                // 如果不一样，说明是别名，根据正确的类名获取实例。
                $object = $this->get($concrete, $params, $config);
            }
        } elseif (is_object($definition)) {
            // 如果是对象，直接注册到全局实例树。并返回。
            return $this->_singletons[$class] = $definition;
        } else {
            throw new InvalidConfigException('Unexpected object definition type: ' . gettype($definition));
        }

        // 如果是使用setSingleton()方法注册的对象，那么将singletons赋值。
        if (array_key_exists($class, $this->_singletons)) {
            // singleton
            $this->_singletons[$class] = $object;
        }

        return $object;
    }

    public function set($class, $definition = [], array $params = [])
    {
        // 将类注册到容器中。
        // 设置类的定义，类的参数。
        // 注销已经存在类实例。（因为重新注册之后，如果不销毁之前的实例，当类的参数不一样的时候，会导致获取的对象是之前注册的类）
        // 但是有个新的问题：同时创建同一个类的两个不同实例（类参数不同），是无法实现的 0.0  或许我们需要借助一个新容器？那么这样做岂非太麻烦了？
        $this->_definitions[$class] = $this->normalizeDefinition($class, $definition);
        $this->_params[$class] = $params;
        unset($this->_singletons[$class]);
        return $this;
    }

    public function setSingleton($class, $definition = [], array $params = [])
    {
        // 这个方法和set()方法差不多，唯一的区别就是，使用set()方法注册的类，每次get()的时候，都是重新生成一个新对象。
        // 而setSingleton()方法永远存储第一次生成的对象，并将其保存在 $this->_singletons属性中。每次调用get()方法，都是获取第一次生成的实例。
        $this->_definitions[$class] = $this->normalizeDefinition($class, $definition);
        $this->_params[$class] = $params;
        $this->_singletons[$class] = null; // 保存键，get()方法中会根据array_key_exists()来判断
        return $this;
    }

    public function has($class)
    {
        return isset($this->_definitions[$class]);
    }

    public function hasSingleton($class, $checkInstance = false)
    {
        // 是否存在实例，第二个参数表示是否已经实例化。
        return $checkInstance ? isset($this->_singletons[$class]) : array_key_exists($class, $this->_singletons);
    }


    public function clear($class)
    {
        // 移除
        unset($this->_definitions[$class], $this->_singletons[$class]);
    }

  
    protected function normalizeDefinition($class, $definition)
    {
        // 将类的定义规范化。

        // $definition为空，返回类名称就是入参$class。注意类名要包含命名空间哦。
        if (empty($definition)) {
            return ['class' => $class];
        } elseif (is_string($definition)) {
            // $definition是字符串，则就是完整的正确的类名称。（包含命名空间的）
            return ['class' => $definition];
        } elseif ($definition instanceof Instance) {
            return ['class' => $definition->id];
        } elseif (is_callable($definition, true) || is_object($definition)) {
            return $definition;
        } elseif (is_array($definition)) {
            if (!isset($definition['class']) && isset($definition['__class'])) {
                $definition['class'] = $definition['__class'];
                unset($definition['__class']);
            }
            if (!isset($definition['class'])) {
                if (strpos($class, '\\') !== false) {
                    $definition['class'] = $class;
                } else {
                    throw new InvalidConfigException('A class definition requires a "class" member.');
                }
            }

            return $definition;
        }

        throw new InvalidConfigException("Unsupported definition type for \"$class\": " . gettype($definition));
    }


    public function getDefinitions()
    {
        return $this->_definitions;
    }

    protected function build($class, $params, $config)
    {
        // 整个容器最关键的方法：创建一个类的实例。发现类的依赖关系，解决依赖。实例化依赖的相关类，并注入。

        /* @var $reflection ReflectionClass */

        // 这里只是获取需要生成实例的参数
        list($reflection, $dependencies) = $this->getDependencies($class);

        // 配置中存在“__construct()”键，覆盖实例化的初始值。
        if (isset($config['__construct()'])) {
            foreach ($config['__construct()'] as $index => $param) {
                $dependencies[$index] = $param;
            }
            unset($config['__construct()']);
        }

        // 参数中存在值，覆盖实例化的初始值。
        foreach ($params as $index => $param) {
            $dependencies[$index] = $param;
        }

        // 这里处理准备生成实例的参数。如果参数是对象，则获取实际需要的具体对象。
        $dependencies = $this->resolveDependencies($dependencies, $reflection);
        if (!$reflection->isInstantiable()) {
            throw new NotInstantiableException($reflection->name);
        }
        if (empty($config)) {
            // 根据参数生成新的实例
            return $reflection->newInstanceArgs($dependencies);
        }

        $config = $this->resolveDependencies($config);

        if (!empty($dependencies) && $reflection->implementsInterface('yii\base\Configurable')) {
            // set $config as the last parameter (existing one will be overwritten)
            // 实现了接口：yii\base\Configurable，则将配置设置为最后一个参数（覆盖写），然后生成实例。
            $dependencies[count($dependencies) - 1] = $config;
            return $reflection->newInstanceArgs($dependencies);
        }

        // 其他情况，$config则是生成实例类中的属性。
        $object = $reflection->newInstanceArgs($dependencies);
        foreach ($config as $name => $value) {
            $object->$name = $value;
        }

        return $object;
    }


    protected function mergeParams($class, $params)
    {
        // 这个方法主要是将类的构造方法中的参数和用户传入的参数合并。

        // $this->_params是容器中所有类的构造方法中参数的全局注册树。
        if (empty($this->_params[$class])) {
            return $params;
        } elseif (empty($params)) {
            return $this->_params[$class];
        }

        $ps = $this->_params[$class];
        foreach ($params as $index => $value) {
            $ps[$index] = $value;
        }

        return $ps;
    }

    protected function getDependencies($class)
    {
        // 这个方法返回了类的所有依赖。
        // 返回的第一个参数是当前类的反射类，第二个参数是相关依赖。

        // 如果已经存在当前类的反射，就直接返回
        if (isset($this->_reflections[$class])) {
            return [$this->_reflections[$class], $this->_dependencies[$class]];
        }

        $dependencies = [];
        try {
            $reflection = new ReflectionClass($class);
        } catch (\ReflectionException $e) {
            throw new InvalidConfigException('Failed to instantiate component or class "' . $class . '".', 0, $e);
        }

        $constructor = $reflection->getConstructor();
        if ($constructor !== null) {
            foreach ($constructor->getParameters() as $param) {
                if (version_compare(PHP_VERSION, '5.6.0', '>=') && $param->isVariadic()) {
                    // php版本大于等于5.6，并且参数是可变的，直接返回。（可变参数是最后一个参数。）
                    break;
                } elseif ($param->isDefaultValueAvailable()) {
                    // 默认值可用，就将默认值存储。
                    $dependencies[] = $param->getDefaultValue();
                } else {
                    $c = $param->getClass();
                    // 没有默认值，获取当前类名称，生成instance实例
                    $dependencies[] = Instance::of($c === null ? null : $c->getName());
                }
            }
        }

        // 赋值并返回。
        $this->_reflections[$class] = $reflection;
        $this->_dependencies[$class] = $dependencies;

        return [$reflection, $dependencies];
    }

    protected function resolveDependencies($dependencies, $reflection = null)
    {
        // 这个方法的作用，就是将目标类中的构造方法中，依赖类的参数，替换为实际的对象实例。
        // 如果当前类不属于引用对象类instance,那么就不做处理。
        foreach ($dependencies as $index => $dependency) {
            if ($dependency instanceof Instance) {
                if ($dependency->id !== null) {
                    // 首先，如果存在id属性，那么就继续从容器中获取依赖类。
                    $dependencies[$index] = $this->get($dependency->id);
                } elseif ($reflection !== null) {
                    // 如果存在反射类，那么就通过反射，获取构造函数类，再获取构造函数参数，再通过索引获取参数名称。
                    $name = $reflection->getConstructor()->getParameters()[$index]->getName();
                    $class = $reflection->getName(); // 获取类名称
                    // 剖出类缺少参数的异常
                    throw new InvalidConfigException("Missing required parameter \"$name\" when instantiating \"$class\".");
                }
            }
        }

        return $dependencies;
    }

    public function invoke(callable $callback, $params = [])
    {
        // 解析函数参数中的依赖，然后调用回调函数。
        return call_user_func_array($callback, $this->resolveCallableDependencies($callback, $params));
    }


    public function resolveCallableDependencies(callable $callback, $params = [])
    {
        if (is_array($callback)) {
            $reflection = new \ReflectionMethod($callback[0], $callback[1]);
        } elseif (is_object($callback) && !$callback instanceof \Closure) {
            $reflection = new \ReflectionMethod($callback, '__invoke');
        } else {
            $reflection = new \ReflectionFunction($callback);
        }

        $args = [];

        // 是否是关联数组
        $associative = ArrayHelper::isAssociative($params);

        foreach ($reflection->getParameters() as $param) {
            $name = $param->getName();
            if (($class = $param->getClass()) !== null) {
                $className = $class->getName();
                if (version_compare(PHP_VERSION, '5.6.0', '>=') && $param->isVariadic()) {
                    // 参数可变，合并参数。并打断。
                    $args = array_merge($args, array_values($params));
                    break;
                } elseif ($associative && isset($params[$name]) && $params[$name] instanceof $className) {
                    $args[] = $params[$name];
                    unset($params[$name]);
                } elseif (!$associative && isset($params[0]) && $params[0] instanceof $className) {
                    $args[] = array_shift($params);
                } elseif (isset(Yii::$app) && Yii::$app->has($name) && ($obj = Yii::$app->get($name)) instanceof $className) {
                    $args[] = $obj;
                } else {
                    // If the argument is optional we catch not instantiable exceptions
                    try {
                        $args[] = $this->get($className);
                    } catch (NotInstantiableException $e) {
                        if ($param->isDefaultValueAvailable()) {
                            $args[] = $param->getDefaultValue();
                        } else {
                            throw $e;
                        }
                    }
                }
            } elseif ($associative && isset($params[$name])) {
                $args[] = $params[$name];
                unset($params[$name]);
            } elseif (!$associative && count($params)) {
                $args[] = array_shift($params);
            } elseif ($param->isDefaultValueAvailable()) {
                $args[] = $param->getDefaultValue();
            } elseif (!$param->isOptional()) {
                $funcName = $reflection->getName();
                throw new InvalidConfigException("Missing required parameter \"$name\" when calling \"$funcName\".");
            }
        }

        foreach ($params as $value) {
            $args[] = $value;
        }

        return $args;
    }

    public function setDefinitions(array $definitions)
    {
        // 实现了 set() 的队列。
        foreach ($definitions as $class => $definition) {
            if (is_array($definition) && count($definition) === 2 && array_values($definition) === $definition && is_array($definition[1])) {
                $this->set($class, $definition[0], $definition[1]);
                continue;
            }

            $this->set($class, $definition);
        }
    }


    public function setSingletons(array $singletons)
    {
        // 实现了 setSingleton() 的队列。
        foreach ($singletons as $class => $definition) {
            if (is_array($definition) && count($definition) === 2 && array_values($definition) === $definition) {
                $this->setSingleton($class, $definition[0], $definition[1]);
                continue;
            }

            $this->setSingleton($class, $definition);
        }
    }
}
```
上边我贴出了完整的容器类以及相关的源码分析。其中比较重要的几个方法是：get()，set()，build()。
真正的实例的创建的方法是build()，而它是在get()方法中进行调用。set()方法只是设置需要实例化它的参数。


## 定位器ServiceLocator.php
​
### $this和new static()
整个框架中，很多地方会用到`$this`。`$this`如果存在类的方法中，表示当前类。但是如果存在子类继承的情况下，则他会永远返回最终调用的子类（不管$this出现在父类或者子类），举个栗子：
```php
class A extends B {
    public function test()
    {
        return "A";
    }
}

class B {
    public function getTest()
    {
        echo $this->test();
    }

    public function test()
    {
         return "B";
    }
}

(new A())->getTest();
```
上边代码的运行结果是会输出"A"。

我们知道，还有两种表示方式和`$this`很接近。`$this` 和 `new self()`没有区别。

从英文的翻译来看，static表示静止的，所以`$this` 和`new static()`的区别是，`new static()` 永远返回当前类。

### 定位器
ServiceLocator全局的定位器。它被Module继承，Module又被应用类Application继承。

整个框架中，大量用到了注册器模式。比如应用类Application把所有用到的组件都注册到定位器（ServiceLocator）的`$_components`属性和`$_definitions`属性。`$_components`保存所有组件的实例，`$_definitions`保存所有组件的基本信息，例如类名称，参数等。而整个`ServiceLocator`的代码非常简单，最主要的方法是get()和set()。get()方法表示获取全局注册的组件实例(即`$_components`属性中的值)，而set()方法则是设置组件的基本信息(即`$_definitions`)。

### 源码解析
```php
    public function get($id, $throwException = true)
    {
        if (isset($this->_components[$id])) {
            return $this->_components[$id];
        }

        if (isset($this->_definitions[$id])) {
            $definition = $this->_definitions[$id];
            if (is_object($definition) && !$definition instanceof Closure) {
                return $this->_components[$id] = $definition;
            }

            return $this->_components[$id] = Yii::createObject($definition);
        } elseif ($throwException) {
            throw new InvalidConfigException("Unknown component ID: $id");
        }

        return null;
    }

    public function set($id, $definition)
    {
        // 组件的注册，注册之后使用get()方法获取这个组件。

        unset($this->_components[$id]);

        if ($definition === null) {
            unset($this->_definitions[$id]);
            return;
        }

        if (is_object($definition) || is_callable($definition, true)) {
            // an object, a class name, or a PHP callable
            $this->_definitions[$id] = $definition;
        } elseif (is_array($definition)) {
            // a configuration array
            if (isset($definition['__class'])) {
                $this->_definitions[$id] = $definition;
                $this->_definitions[$id]['class'] = $definition['__class'];
                unset($this->_definitions[$id]['__class']);
            } elseif (isset($definition['class'])) {
                $this->_definitions[$id] = $definition;
            } else {
                throw new InvalidConfigException("The configuration for the \"$id\" component must contain a \"class\" element.");
            }
        } else {
            throw new InvalidConfigException("Unexpected configuration type for the \"$id\" component: " . gettype($definition));
        }
     }
```
这个类中的set和get方法和容器中的get和set方法其实很相似，容器中的更为复杂。当然，定位器中的方法的创建也是在get()方法中，如果`$_components`属性中没有，那么就根据`$_definitions`属性，生成新的实例。

## 错误和异常处理​
所有的框架的错误处理机制，都在整个框架运行的顺序中排在前列，一般错误处理机制排在常量定义、配置加载、类的自动加载之后，排在其他流程逻辑之前。

### base\Application
错误处理的入口是应用类的基类`base\Application`的构造方法中实现
```php
    public function __construct($config = [])
    {
      
        // 当application基类被继承之后，Yii::$app就变成了继承子类。
        Yii::$app = $this;

        // 将当前应用注册到$this->loadedModules
        static::setInstance($this);

        // 表示应用已开始
        $this->state = self::STATE_BEGIN;
        // 下面的配置数组传引用
        // 初始化准备
        $this->preInit($config);

        // 注册错误处理
        $this->registerErrorHandler($config);

        // 组件初始化
        Component::__construct($config);
    }


    public function preInit(&$config)
    {
        // 配置中id 和 basePath 必传， 表示应用的id和应用的部署根路径
        if (!isset($config['id'])) {
            throw new InvalidConfigException('The "id" configuration for the Application is required.');
        }
        if (isset($config['basePath'])) {
            $this->setBasePath($config['basePath']);
            unset($config['basePath']);
        } else {
            throw new InvalidConfigException('The "basePath" configuration for the Application is required.');
        }

        // 设置一些路径
        if (isset($config['vendorPath'])) {
            $this->setVendorPath($config['vendorPath']);
            unset($config['vendorPath']);
        } else {
            // set "@vendor"
            $this->getVendorPath();
        }
        if (isset($config['runtimePath'])) {
            $this->setRuntimePath($config['runtimePath']);
            unset($config['runtimePath']);
        } else {
            // set "@runtime"
            $this->getRuntimePath();
        }

        // 设置时区
        if (isset($config['timeZone'])) {
            $this->setTimeZone($config['timeZone']);
            unset($config['timeZone']);
        } elseif (!ini_get('date.timezone')) {
            $this->setTimeZone('UTC');
        }

        // 如果存在容器的配置，就设置容器的初始属性
        if (isset($config['container'])) {
            $this->setContainer($config['container']);
            unset($config['container']);
        }

        // merge core components with custom components
        // 合并核心组件的初始配置
        foreach ($this->coreComponents() as $id => $component) {
            if (!isset($config['components'][$id])) {
                $config['components'][$id] = $component;
            } elseif (is_array($config['components'][$id]) && !isset($config['components'][$id]['class'])) {
                $config['components'][$id]['class'] = $component['class'];
            }
        }
    }
```

我们可以看到，在错误注册之前，做了一些对`$config`的一些初始化的准备操作。就是将`$config`里面的某些配置项，赋值到当前应用的具体属性。并且，在Component没有初始化之前，`$config`在preInit()和registerErrorHandler()方法中是引用传值，表示`$config`可以在方法体中被修改。我们接下来看下错误处理的方法registerErrorHandler()

### registerErrorHandler()
```php
    protected function registerErrorHandler(&$config)
    {
        // 注册php错误处理

        // 开启了错误处理，则进行错误处理
        if (YII_ENABLE_ERROR_HANDLER) {
            // 配置组件中，如果没有错误处理类，那么就直接挂
            // 注意，错误处理errorHandler的默认核心类在web\Application也就是子类里面，将获取核心组件配置覆盖写，并merge了。
            if (!isset($config['components']['errorHandler']['class'])) {
                echo "Error: no errorHandler component is configured.\n";
                exit(1);
            }

            // 将错误处理类，注册到全局的组件树上。
            $this->set('errorHandler', $config['components']['errorHandler']);

            // 组件可以全局获取了。配置中没有必要存在了。避免Component初始化的时候，设置属性报错。
            unset($config['components']['errorHandler']);

            // 真正的错误处理机制
            $this->getErrorHandler()->register();
        }
    }
```
可以看到，`registerErrorHandler()`方法只是将错误异常处理类加载到全局组件components上。真正执行错误处理的方法再`ErrorHandler.php`这个类里面。这种方式很好的实现了程序的解耦。

### ErrorHandler.php
```php
    public function register()
    {
        // 错误和异常的注册
        // 单例，避免重复执行
        if (!$this->_registered) {

            // 关闭错误显示，设置异常处理的方法
            ini_set('display_errors', false);
            set_exception_handler([$this, 'handleException']);

            // 使用 HHVM_VERSION 判断是否已经定义，存在代表是当前运行环境是虚拟机环境。分别设置错误处理方法。
            if (defined('HHVM_VERSION')) {
                set_error_handler([$this, 'handleHhvmError']);
            } else {
                set_error_handler([$this, 'handleError']);
            }

            // 如果保留了内存（用于处理内存溢出的致命错误）
            if ($this->memoryReserveSize > 0) {
                // 将"x"重复写$this->memoryReserveSize次，保留起来。（即保留的内存）
                $this->_memoryReserve = str_repeat('x', $this->memoryReserveSize);
            }

            // 程序终止，处理函数
            register_shutdown_function([$this, 'handleFatalError']);
            $this->_registered = true;
        }
    }
    

    public function handleException($exception)
    {
        // 异常处理的方法。使用前得先注册。通过php的异常处理机制来实现。

        // 如果应用程序正常终止，则不做处理。
        if ($exception instanceof ExitException) {
            return;
        }

        $this->exception = $exception;

        // 处理异常的时候，先禁用错误的捕获，避免出现递归。
        $this->unregister();

        // 设置http状态码
        if (PHP_SAPI !== 'cli') {
            http_response_code(500);
        }

        try {
            // 异常记录日志
            $this->logException($exception);
            if ($this->discardExistingOutput) {
                //如果开启了“丢弃页面输出”，就清理当前页面
                $this->clearOutput();
            }

            // 异常呈现。
            $this->renderException($exception);

            // 测试环境，清洗内存日志并退出。
            if (!YII_ENV_TEST) {
                \Yii::getLogger()->flush(true);
                if (defined('HHVM_VERSION')) {
                    flush();
                }
                exit(1);
            }
        } catch (\Exception $e) {
            $this->handleFallbackExceptionMessage($e, $exception);
        } catch (\Throwable $e) {
            $this->handleFallbackExceptionMessage($e, $exception);
        }
        // 异常处理完了，就置空。
        $this->exception = null;
    }
    
    public function unregister()
    {
        // 恢复php的错误处理和异常处理。即取消了当前错误类的初始化（注册）。
        if ($this->_registered) {
            restore_error_handler();
            restore_exception_handler();
            $this->_registered = false;
        }
    }

    public function handleError($code, $message, $file, $line)
    {
        if (error_reporting() & $code) {
            // 错误类手动导入，避免自动加载发生错误的时候，导致错误处理机制无法正常运行。
            if (!class_exists('yii\\base\\ErrorException', false)) {
                require_once __DIR__ . '/ErrorException.php';
            }
            $exception = new ErrorException($message, $code, $code, $file, $line);

            if (PHP_VERSION_ID < 70400) {
                // 在 PHP 7.4 之前，不能在 __toString() 内部抛出异常 - 它会导致致命错误
                $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
                array_shift($trace);
                foreach ($trace as $frame) {
                    if ($frame['function'] === '__toString') {
                        $this->handleException($exception);
                        if (defined('HHVM_VERSION')) {
                            flush();
                        }
                        exit(1);
                    }
                }
            }

            throw $exception;
        }

        return false;
    }

    public function handleFatalError()
    {
        // 把预先占的内存释放。
        unset($this->_memoryReserve);

        // load ErrorException manually here because autoloading them will not work
        // when error occurs while autoloading a class

        if (!class_exists('yii\\base\\ErrorException', false)) {
            require_once __DIR__ . '/ErrorException.php';
        }

        $error = error_get_last();

        // 这块后面的其实都是正常的流程。因为致命错误，预先保留了一点内存，所以可以单独进行处理。
        if (ErrorException::isFatalError($error)) {
            if (!empty($this->_hhvmException)) {
                $exception = $this->_hhvmException;
            } else {
                $exception = new ErrorException($error['message'], $error['type'], $error['type'], $error['file'], $error['line']);
            }
            $this->exception = $exception;

            $this->logException($exception);

            if ($this->discardExistingOutput) {
                $this->clearOutput();
            }
            $this->renderException($exception);

            // need to explicitly flush logs because exit() next will terminate the app immediately
            Yii::getLogger()->flush(true);
            if (defined('HHVM_VERSION')) {
                flush();
            }
            exit(1);
        }
    }
```
可以看到`register()`方法中，使用了函数：set_exception_handler()、set_error_handler()、register_shutdown_function()，分别注册了异常处理，错误处理，程序终止处理。

​
## 请求和响应

### 应用入口​
首先，yii框架的应用的整个运行过程有一个生命周期，生命周期的状态是从0到6，代表从应用的开始到结束。中间不同的生命周期，会使用框架中的事件机制触发不同的生命周期方法（这里只讲整个请求和响应的流程，具体涉及到的事件后面的博文再讲）。这里把生命周期列出来，大家有个印象。
```php
const STATE_BEGIN = 0;

const STATE_INIT = 1;

const STATE_BEFORE_REQUEST = 2;

const STATE_HANDLING_REQUEST = 3;

const STATE_AFTER_REQUEST = 4;

const STATE_SENDING_RESPONSE = 5;

const STATE_END = 6;
```

从英文的字面意思就能看出，不同的常量表示哪一个生命周期，这里不做过多赘述。整个应用的入口是run()方法：
```php
    public function run()
    {
        // 这里是运行整个应用的入口

        // 按照整个应用的生命周期去进行相应的操作。
        try {
            // 请求之前(即将发送请求)
            $this->state = self::STATE_BEFORE_REQUEST;
            $this->trigger(self::EVENT_BEFORE_REQUEST);

            // 请求中
            $this->state = self::STATE_HANDLING_REQUEST;
            $response = $this->handleRequest($this->getRequest());

            // 请求之后
            $this->state = self::STATE_AFTER_REQUEST;
            $this->trigger(self::EVENT_AFTER_REQUEST);

            // 响应之前(即将响应请求)
            $this->state = self::STATE_SENDING_RESPONSE;
            $response->send();

            // 应用运行结束
            $this->state = self::STATE_END;

            return $response->exitStatus;
        } catch (ExitException $e) {
            // 整个生命周期过程中，如果出现错误，调用应用结束的方法（区别直接exit，这样会完善一个应用的生命周期）。
            $this->end($e->statusCode, isset($response) ? $response : null);
            return $e->statusCode;
        }
    }
```
### 请求
我们重点看"请求之中"，框架的处理：
```php
public function handleRequest($request)
    {
        // 处理请求，并返回响应实例。

        // 如果$this->catchAll不为空，表示单个路由操作处理所有用户的所有请求。一般用在维护模式。
        // 如果$this->catchAll为空，表示正常路由解析流程。
        if (empty($this->catchAll)) {
            try {
                list($route, $params) = $request->resolve();
            } catch (UrlNormalizerRedirectException $e) {
                // 发生错误，url重定向。
                $url = $e->url;
                if (is_array($url)) {
                    if (isset($url[0])) {
                        // ensure the route is absolute
                        $url[0] = '/' . ltrim($url[0], '/');
                    }
                    $url += $request->getQueryParams();
                }

                return $this->getResponse()->redirect(Url::to($url, $e->scheme), $e->statusCode);
            }
        } else {
            $route = $this->catchAll[0];
            $params = $this->catchAll;
            unset($params[0]);
        }

        // 现在已经成功解析了路由和参数
        try {
            Yii::debug("Route requested: '$route'", __METHOD__);
            $this->requestedRoute = $route;

            // 构造请求控制器实例，将执行控制器方法。$result即控制器方法运行结果。
            // $result如果是response的实例，就直接返回。否则将其赋值到data,再返回。
            $result = $this->runAction($route, $params);
            if ($result instanceof Response) {
                return $result;
            }

            $response = $this->getResponse();
            if ($result !== null) {
                $response->data = $result;
            }

            return $response;
        } catch (InvalidRouteException $e) {
            throw new NotFoundHttpException(Yii::t('yii', 'Page not found.'), $e->getCode(), $e);
        }
    }
```
应用"请求之中"，调用了`handleRequest()`方法，入参是当前请求实例。通过解析请求实例`$request`中的请求参数（当前请求url），获取请求路由和参数，并根据路由构造控制器实例，执行路由中对应的控制器方法。最后，返回应用响应实例。

然后我们看到，在应用结束之前，执行了响应类的send方法：
```php
$response->send();
```
### 响应
我们根据send()方法，看到响应做了哪些事情：
```php
    public function send()
    {
        // 向客户端响应

        // 已经发送就直接返回
        if ($this->isSent) {
            return;
        }

        // 响应前的事件
        $this->trigger(self::EVENT_BEFORE_SEND);

        // 准备工作
        $this->prepare();

        // 准备工作之后的事件
        $this->trigger(self::EVENT_AFTER_PREPARE);

        // 发送响应头（通过header函数）
        $this->sendHeaders();

        // 发送响应内容（通过直接echo）
        $this->sendContent();

        // 发送之后的事件
        $this->trigger(self::EVENT_AFTER_SEND);
        $this->isSent = true;
    }
```
重点分析一下响应内容的发送：
```php
    protected function sendContent()
    {
        // 如果不是文件流，则直接 echo 内容。
        if ($this->stream === null) {
            echo $this->content;
            return;
        }

        // 设置不超时
        if (function_exists('set_time_limit')) {
            set_time_limit(0); // Reset time limit for big files
        } else {
            Yii::warning('set_time_limit() is not available', __METHOD__);
        }

        $chunkSize = 8 * 1024 * 1024; // 8MB per chunk

        // 如果是数组，表示固定文件读取内容的开始和结尾。
        if (is_array($this->stream)) {
            list($handle, $begin, $end) = $this->stream;
            // fseek() 函数在打开的文件中定位。
            fseek($handle, $begin); // 将文件$handle指针移动到$begin位置。

            // 文件没有到达末尾，并且当前位置小于设置的文件结束位置。则循环
            while (!feof($handle) && ($pos = ftell($handle)) <= $end) {
                // 如果当前位置+8M大于结束位置。表示就将输出单位变为$end - $pos + 1。这个正好表示文件需要结束总大小+1。表示不需要下次循环了，并且减少了文件的扫描范围。
                if ($pos + $chunkSize > $end) {
                    $chunkSize = $end - $pos + 1;
                }
                echo fread($handle, $chunkSize);
                flush(); // Free up memory. Otherwise large files will trigger PHP's memory limit.
            }
            fclose($handle);
        } else {
            // eof() 函数检查是否已到达文件末尾（EOF）。
            // 如果没有到达文件末尾，则以8M为一个单位，输出文件内容。
            while (!feof($this->stream)) {
                echo fread($this->stream, $chunkSize);
                flush();
            }
            fclose($this->stream);
        }
    }
```
可以看到，响应的内容支持文件流和字符串两种方式。那么通过阅读源码，我们知道，在控制器的方法中可以这样写：
```php
    public function actionIndex()
    {
        $responseContent = [
            "name" => "Jone",
            "pass" => "123456",
        ];
        \Yii::$app->response->content = json_encode($responseContent);
        return;
    }
```
当然，如果你return了一个字符串，则会以你return的这个字符串为主。它会作为response实例的data属性，会在返回前初始化，覆盖掉原来的content属性。

## 属性、行为和事件类component.php

Yii2框架中的组件类component.php。这个组件类囊括了今天要讲的主题：属性、行为和事件。

首先在这里解释一下什么是属性，什么事行为，什么是事件。

### 属性        

属性就是指类的成员变量，Yii2框架中的组件类component.php继承了对象基础类BaseObject.php。在对象基础类里面，运用php中的魔术方法__get()和__set()，实现对类属性的赋值和获取。

### 行为

行为和php的trait有点类似。使用行为必须继承组件类component.php（或行为类Behavior.php），它无须改变类继承关系，即可增强一个已有的组件类功能。 当行为附加到组件后，它将“注入”它的方法和属性到组件， 然后可以像访问组件内定义的方法和属性一样访问它们。

### 事件

事件和thinkPHP中钩子的概念差不多。事件可以将自定义代码“注入”到现有代码中的特定执行点。 附加自定义代码到某个事件，当这个事件被触发时，这些代码就会自动执行。 

### 源码分析
首先看下对象基础类BaseObject.php的源码，然后分析它主要的功能是什么。

BaseObject.php
```php
<?php

class BaseObject implements Configurable
{
    //这是我一个对象基础类，主要用于属性的设置和获取。
    //当类的属性只有获取方法（getter），没有设置方法（setter）则认为此属性只读。
    //生命周期：
    //构造函数 -> 对象属性初始化 -> init函数


    public static function className()
    {
        // 获取调用者完整类名
        return get_called_class();
    }

    public function __construct($config = [])
    {
        // 存在配置，设置当前类默认属性。
        if (!empty($config)) {
            Yii::configure($this, $config);
        }
        $this->init();
    }

    public function init()
    {
    }

    public function __get($name)
    {
        $getter = 'get' . $name;
        if (method_exists($this, $getter)) { // 存在获取器，直接获取。
            return $this->$getter();
        } elseif (method_exists($this, 'set' . $name)) { //不存在获取器，但是存在设置器。那么就抛出错误。
            throw new InvalidCallException('Getting write-only property: ' . get_class($this) . '::' . $name);
        }

        // 不存在获取器也不存在设置器，直接属性不存在异常。（注意：是获取不存在的属性或者是没有访问权限的属性）
        throw new UnknownPropertyException('Getting unknown property: ' . get_class($this) . '::' . $name);
    }

    public function __set($name, $value)
    {
        $setter = 'set' . $name;
        if (method_exists($this, $setter)) { // 存在设置器，就设置属性
            $this->$setter($value);
        } elseif (method_exists($this, 'get' . $name)) { // 如果不存在设置器，而存在获取器，则表示属性只读。抛出错误。
            throw new InvalidCallException('Setting read-only property: ' . get_class($this) . '::' . $name);
        } else {
            // 属性不存在
            throw new UnknownPropertyException('Setting unknown property: ' . get_class($this) . '::' . $name);
        }
    }

    public function __isset($name)
    {
        // 使用isset()判断对象属性是否存在时候调用。
        $getter = 'get' . $name;
        if (method_exists($this, $getter)) {
            // 如果存在getter，则根据获取器返回值判断是否null。是null则false。否则ture;
            return $this->$getter() !== null;
        }
        // 不存在getter直接false;
        return false;
    }

    public function __unset($name)
    {
        // 使用unset()销毁对象属性时调用。

        $setter = 'set' . $name;
        if (method_exists($this, $setter)) { // 存在设置器，就设置为null.
            $this->$setter(null);
        } elseif (method_exists($this, 'get' . $name)) { // 不存在设置器，存在获取器，返回“销毁只读属性”错误。
            throw new InvalidCallException('Unsetting read-only property: ' . get_class($this) . '::' . $name);
        }
        // 否则不做处理。
    }


    public function __call($name, $params)
    {
        // 调用类的未知方法，直接抛出“调用未知方法”错误。
        throw new UnknownMethodException('Calling unknown method: ' . get_class($this) . "::$name()");
    }


    public function hasProperty($name, $checkVars = true)
    {
        // 如果不存在获取器，并且类属性不存在。那么如果存在设置器，则返回真。
        return $this->canGetProperty($name, $checkVars) || $this->canSetProperty($name, false);
    }


    public function canGetProperty($name, $checkVars = true)
    {
        // 是否存在获取器。如果第二参数为真，就是：是否存在类属性。
        return method_exists($this, 'get' . $name) || $checkVars && property_exists($this, $name);
        // 上面的写法相当于
        /*if (method_exists($this, 'get' . $name)) {
            return method_exists($this, 'get' . $name);
        } else {
            if ($checkVars) {
                return property_exists($this, $name);
            } else {
                return $checkVars;
            }
        }*/
    }


    public function canSetProperty($name, $checkVars = true)
    {
        // 是否存在设置器。如果第二参数为真，就是：是否存在类属性。
        return method_exists($this, 'set' . $name) || $checkVars && property_exists($this, $name);
    }


    public function hasMethod($name)
    {
        return method_exists($this, $name);
    }
}
```
首先我们看到，这个类的构造方法，先通过配置的方式，设置了继承子类的初始属性。所以继承类不需要覆盖写当前类的构造方法，只需要覆盖init()这个方法即可。

其次，继承这个类的子类，可以添加设置器方法setter和获取器方法getter来对类的属性值进行特殊处理。整体代码也比较简单。这里不做过多赘述。

### component.php

首先，yii框架的行为和事件的功能设计中，都用到了注册器模式。都是先把行为或者事件注册到组件类的全局树上（`$_events`和`$_behaviors`）。然后再在程序里面，在需要的地方进行相应操作。我在博客中，把行为或者事件“注入”到全局树上的这个操作称为“绑定”，把行为或者事件“取消注入”全局树的操作称为“解绑”。这里将行为和事件分开来讲吧，我们先将实现原理，再来看源码。主要代码都在组件类component.php中。

### 事件的实现原理

首先来讲事件，前面已经大概讲了一下事件的概念。使用事件，必须继承component.php组件类。整个事件的使用分为2~3个步骤。

1. 绑定事件到全局。
2. 调用trigger方法触发事件。
3.解绑事件。

事件的全局树上保存的是事件名称，以及事件的处理器（真正的执行程序）。事件的处理器可以是以下几种类型：

1. 类的静态方法
2. 对象的方法
3. 匿名函数
4. 全局函数

实现原理是这样的：

1. 绑定：将事件名称为键，事件处理器作为值（也是一个数组，可能为多个）作为值，保存到全局。
2. 触发：根据传入的事件名称，从全局树上获取对应的事件处理器。利用php函数call_user_func()。触发事件处理器的执行程序。
3. 解绑：正常情况下，解绑是没必要做的（事件类里面定义了事件是否触发的属性）。解绑也可以在事件触发之前调用。解绑就是把事件全局树上对应的事件销毁。（也可以销毁某一事件的某一具体的处理器）

### 行为的实现原理

行为的概念前面也已经讲过了。这里具体讲一下使用和框架中的实现原理。

行为的使用主要是行为的绑定和解绑。绑定就是将行为类，绑定到组件中，那么这个组件就拥有了这个行为的全部方法和属性。解绑就是解除此行为对组件的绑定。

实现原理：

解绑的原理和事件是一样的。就是注销全局行为树种的一个值。这里主要讲绑定。

绑定的实现也非常简单。首先component.php继承了BaseObject.php，BaseObject.php里面针对普通类的属性的设置和获取做了优化，可以添加设置器或者获取器，来对属性做一些特殊处理。这里component.php覆盖写了父类BaseObject.php中的所有方法，进一步进行优化，__set()、__get()等魔术方法中添加了对行为的判断。例如__get()方法这样写：
```php
    public function __get($name)
    {
        $getter = 'get' . $name;
        if (method_exists($this, $getter)) {
            // read property, e.g. getName()
            return $this->$getter();
        }

        // behavior property
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $behavior) {
            if ($behavior->canGetProperty($name)) {
                return $behavior->$name;
            }
        }

        if (method_exists($this, 'set' . $name)) {
            throw new InvalidCallException('Getting write-only property: ' . get_class($this) . '::' . $name);
        }

        throw new UnknownPropertyException('Getting unknown property: ' . get_class($this) . '::' . $name);
    }
```
我们可以看到，如果从当前组件中没有获取到属性的话，就会从当前组件绑定的行为中开始找，寻找行为对象中的属性，找到并返回。实现了对当前组件类的扩展。其他方法也是一样的。

### component.php的源码解析:
```php
<?php
namespace yii\base;

use Opis\Closure\ClosureStream;
use Yii;
use yii\helpers\StringHelper;


class Component extends BaseObject
{
  
    private $_events = [];

    private $_eventWildcards = [];

    private $_behaviors;

    public function __get($name)
    {
        $getter = 'get' . $name;
        if (method_exists($this, $getter)) {
            // read property, e.g. getName()
            return $this->$getter();
        }

        // behavior property
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $behavior) {
            if ($behavior->canGetProperty($name)) {
                return $behavior->$name;
            }
        }

        if (method_exists($this, 'set' . $name)) {
            throw new InvalidCallException('Getting write-only property: ' . get_class($this) . '::' . $name);
        }

        throw new UnknownPropertyException('Getting unknown property: ' . get_class($this) . '::' . $name);
    }

    public function __set($name, $value)
    {
        // 魔术方法。
        // 如果存在设置器， 就调用设置器
        $setter = 'set' . $name;
        if (method_exists($this, $setter)) {
            // set property
            $this->$setter($value);

            return;
        } elseif (strncmp($name, 'on ', 3) === 0) {
            // "on "开头，表示是事件事件处理器，将事件处理器绑定到对应的时间名称
            // on event: attach event handler
            $this->on(trim(substr($name, 3)), $value);

            return;
        } elseif (strncmp($name, 'as ', 3) === 0) {
            // "as "开头，表示是行为。将行为附加到行为对象全局树。
            // as behavior: attach behavior
            $name = trim(substr($name, 3));
            $this->attachBehavior($name, $value instanceof Behavior ? $value : Yii::createObject($value));

            return;
        }

        // 既不存在设置器，也不是事件和行为。那么可能是行为的属性。
        // behavior property
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $behavior) {
            if ($behavior->canSetProperty($name)) {
                $behavior->$name = $value;
                return;
            }
        }

        // 存在获取器，表示这个属性是只读的。
        if (method_exists($this, 'get' . $name)) {
            throw new InvalidCallException('Setting read-only property: ' . get_class($this) . '::' . $name);
        }

        throw new UnknownPropertyException('Setting unknown property: ' . get_class($this) . '::' . $name);
    }

    public function __isset($name)
    {
        $getter = 'get' . $name;
        if (method_exists($this, $getter)) {
            return $this->$getter() !== null;
        }

        // 区别于基类BaseObject的方法，新增一层行为的属性。

        // behavior property
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $behavior) {
            if ($behavior->canGetProperty($name)) {
                return $behavior->$name !== null;
            }
        }

        return false;
    }

    public function __unset($name)
    {
        $setter = 'set' . $name;
        if (method_exists($this, $setter)) {
            $this->$setter(null);
            return;
        }

        // behavior property
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $behavior) {
            if ($behavior->canSetProperty($name)) {
                $behavior->$name = null;
                return;
            }
        }

        throw new InvalidCallException('Unsetting an unknown or read-only property: ' . get_class($this) . '::' . $name);
    }

    public function __call($name, $params)
    {
        // 调用行为的方法。

        $this->ensureBehaviors();
        foreach ($this->_behaviors as $object) {
            if ($object->hasMethod($name)) {
                return call_user_func_array([$object, $name], $params);
            }
        }
        throw new UnknownMethodException('Calling unknown method: ' . get_class($this) . "::$name()");
    }

    public function __clone()
    {
        // 被克隆的时候，清空克隆对象的行为和事件。
        $this->_events = [];
        $this->_eventWildcards = [];
        $this->_behaviors = null;
    }

    public function hasProperty($name, $checkVars = true, $checkBehaviors = true)
    {
        return $this->canGetProperty($name, $checkVars, $checkBehaviors) || $this->canSetProperty($name, false, $checkBehaviors);
    }

  
    public function canGetProperty($name, $checkVars = true, $checkBehaviors = true)
    {
        if (method_exists($this, 'get' . $name) || $checkVars && property_exists($this, $name)) {
            return true;
        } elseif ($checkBehaviors) {
            $this->ensureBehaviors();
            foreach ($this->_behaviors as $behavior) {
                if ($behavior->canGetProperty($name, $checkVars)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function canSetProperty($name, $checkVars = true, $checkBehaviors = true)
    {
        if (method_exists($this, 'set' . $name) || $checkVars && property_exists($this, $name)) {
            return true;
        } elseif ($checkBehaviors) {
            $this->ensureBehaviors();
            foreach ($this->_behaviors as $behavior) {
                if ($behavior->canSetProperty($name, $checkVars)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function hasMethod($name, $checkBehaviors = true)
    {
        if (method_exists($this, $name)) {
            return true;
        } elseif ($checkBehaviors) {
            $this->ensureBehaviors();
            foreach ($this->_behaviors as $behavior) {
                if ($behavior->hasMethod($name)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function behaviors()
    {
        // 返回行为列表。默认都是空，如果需要添加，需要在子类覆盖
        // 覆盖需注意：
        // 返回的键是行为名称（也可以不设置键），返回的值是对应的扩展行为对象实例
        return [];
    }

    public function hasEventHandlers($name)
    {
        // 又是他，这块是判断事件是否绑定了处理程序
        $this->ensureBehaviors();

        // 通配符模式，如果存在行为名称且存在事件处理，返回真。
        foreach ($this->_eventWildcards as $wildcard => $handlers) {
            if (!empty($handlers) && StringHelper::matchWildcard($wildcard, $name)) {
                return true;
            }
        }

        // 如果当前存在事件存在值，就返回真。否则在事件类里面判断。
        return !empty($this->_events[$name]) || Event::hasHandlers($this, $name);
    }

    public function on($name, $handler, $data = null, $append = true)
    {
        // 将事件处理程序绑定到对应事件。时间处理程序支持以下几种方式：
        // 1. 匿名函数
        // 2. 函数的方法
        // 3. 类的静态方法
        // 4. 全局函数

        $this->ensureBehaviors();

        // 通配符模式
        if (strpos($name, '*') !== false) {
            if ($append || empty($this->_eventWildcards[$name])) { // 如果追加，或者当前事件名称的处理程序为空。就把当前处理程序给它加到最后一位。
                $this->_eventWildcards[$name][] = [$handler, $data];
            } else { // 如果不追加，那么就将事件处理程序加在第一位，优先处理。
                array_unshift($this->_eventWildcards[$name], [$handler, $data]);
            }
            return;
        }

        // 普通模式
        if ($append || empty($this->_events[$name])) {
            $this->_events[$name][] = [$handler, $data];
        } else {
            array_unshift($this->_events[$name], [$handler, $data]);
        }
    }

    public function off($name, $handler = null)
    {
        // 将事件处理程序移除对应事件

        $this->ensureBehaviors();

        // 如果当前事件不存在，返回false
        if (empty($this->_events[$name]) && empty($this->_eventWildcards[$name])) {
            return false;
        }

        // 如果处理器是null,直接清除当前事件所有处理器
        if ($handler === null) {
            unset($this->_events[$name], $this->_eventWildcards[$name]);
            return true;
        }

        // 是否已经移除
        $removed = false;
        // plain event names
        // 普通事件名称清除
        if (isset($this->_events[$name])) { // 这个判断多余了吧？
            foreach ($this->_events[$name] as $i => $event) {
                if ($event[0] === $handler) {
                    unset($this->_events[$name][$i]);
                    $removed = true;
                }
            }
            if ($removed) {
                // 重置键
                $this->_events[$name] = array_values($this->_events[$name]);
                return $removed;
            }
        }

        // wildcard event names
        // 通配符事件名称处理
        if (isset($this->_eventWildcards[$name])) { // 这个判断多余了吧？
            foreach ($this->_eventWildcards[$name] as $i => $event) {
                if ($event[0] === $handler) {
                    unset($this->_eventWildcards[$name][$i]);
                    $removed = true;
                }
            }
            if ($removed) {
                $this->_eventWildcards[$name] = array_values($this->_eventWildcards[$name]);
                // remove empty wildcards to save future redundant regex checks:
                if (empty($this->_eventWildcards[$name])) {
                    unset($this->_eventWildcards[$name]);
                }
            }
        }

        return $removed;
    }

    public function trigger($name, Event $event = null)
    {
        // 触发事件

        $this->ensureBehaviors();

        $eventHandlers = [];
        foreach ($this->_eventWildcards as $wildcard => $handlers) {
            // 如果当前事件名称，和通配符匹配了。就把通配符的处理器保存起来。
            if (StringHelper::matchWildcard($wildcard, $name)) {
                $eventHandlers = array_merge($eventHandlers, $handlers);
            }
        }

        // 合并通配符匹配到的处理器，与当前事件的处理器。
        if (!empty($this->_events[$name])) {
            $eventHandlers = array_merge($eventHandlers, $this->_events[$name]);
        }

        if (!empty($eventHandlers)) {
            if ($event === null) {
                $event = new Event();
            }
            if ($event->sender === null) {
                $event->sender = $this;
            }
            $event->handled = false;
            $event->name = $name;
            foreach ($eventHandlers as $handler) {
                $event->data = $handler[1];
                call_user_func($handler[0], $event);
                // stop further handling if the event is handled
                if ($event->handled) {
                    return;
                }
            }
        }

        // invoke class-level attached handlers
        Event::trigger($this, $name, $event);
    }


    public function getBehavior($name)
    {
        $this->ensureBehaviors();
        return isset($this->_behaviors[$name]) ? $this->_behaviors[$name] : null;
    }

    public function getBehaviors()
    {
        $this->ensureBehaviors();
        return $this->_behaviors;
    }

    public function attachBehavior($name, $behavior)
    {
        $this->ensureBehaviors();
        return $this->attachBehaviorInternal($name, $behavior);
    }

    public function attachBehaviors($behaviors)
    {
        $this->ensureBehaviors();
        foreach ($behaviors as $name => $behavior) {
            $this->attachBehaviorInternal($name, $behavior);
        }
    }

    public function detachBehavior($name)
    {
        $this->ensureBehaviors();
        if (isset($this->_behaviors[$name])) {
            $behavior = $this->_behaviors[$name];
            unset($this->_behaviors[$name]);
            $behavior->detach();
            return $behavior;
        }

        return null;
    }

    public function detachBehaviors()
    {
        $this->ensureBehaviors();
        foreach ($this->_behaviors as $name => $behavior) {
            $this->detachBehavior($name);
        }
    }


    public function ensureBehaviors()
    {
        // 确保行为已经存在当前类的$this->_behaviors属性
        // 只要是涉及到行为的操作的方法，都会调用一遍这个方法。这个其实可以在构造方法里面，只调用一次就可以了。不知道作者为啥要这样写。。。

        if ($this->_behaviors === null) {
            $this->_behaviors = [];
            foreach ($this->behaviors() as $name => $behavior) {
                $this->attachBehaviorInternal($name, $behavior);
            }
        }
    }


    private function attachBehaviorInternal($name, $behavior)
    {
        // 不属于行为类的对象，则生成一个实例($behavior就是需要生成行为实例的参数)
        if (!($behavior instanceof Behavior)) {
            $behavior = Yii::createObject($behavior);
        }

        // 如果整数，直接附加到行为列表(匿名)
        if (is_int($name)) {
            $behavior->attach($this);
            $this->_behaviors[] = $behavior;
        } else {
            // 如果是字符串，判断存在的话，先解绑，然后再绑定。
            if (isset($this->_behaviors[$name])) {
                $this->_behaviors[$name]->detach();
            }
            $behavior->attach($this);
            $this->_behaviors[$name] = $behavior;
        }

        return $behavior;
    }
}
```

​
​​