#!/usr/bin/env python3
"""
AUDITORÍA TESTSPRITE - ANÁLISIS ESTÁTICO
Ejecuta análisis de cobertura de los casos de prueba TC001-TC015
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

class TestSpriteAuditor:
    def __init__(self, tests_dir="testsprite_tests"):
        self.tests_dir = tests_dir
        self.tests = []
        self.results = {
            "total_tests": 0,
            "coverage": defaultdict(list),
            "features": defaultdict(list),
            "issues": [],
            "recommendations": []
        }
        
    def scan_tests(self):
        """Escanea todos los archivos de prueba"""
        test_files = sorted(Path(self.tests_dir).glob("TC*.py"))
        for test_file in test_files:
            self.analyze_test(test_file)
        self.results["total_tests"] = len(self.tests)
        
    def analyze_test(self, test_file):
        """Analiza un archivo de prueba individual"""
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            test_info = {
                "filename": test_file.name,
                "number": self._extract_test_number(test_file.name),
                "title": self._extract_title(test_file.name),
                "lines": len(content.split('\n')),
                "features": self._extract_features(content),
                "endpoints": self._extract_endpoints(content),
                "selectors": self._extract_selectors(content),
                "assertions": self._extract_assertions(content),
                "wait_conditions": self._extract_wait_conditions(content),
                "issues": self._identify_issues(content),
                "coverage": self._calculate_coverage(content)
            }
            
            self.tests.append(test_info)
            self._update_results(test_info)
            
        except Exception as e:
            self.results["issues"].append(f"Error analizando {test_file.name}: {str(e)}")
    
    def _extract_test_number(self, filename):
        match = re.search(r'TC(\d+)', filename)
        return int(match.group(1)) if match else 0
    
    def _extract_title(self, filename):
        # TC001_User_sign_up_and_login... -> "User sign up and login..."
        title = filename.replace('.py', '').replace('TC', '').split('_', 1)
        return title[1].replace('_', ' ') if len(title) > 1 else filename
    
    def _extract_features(self, content):
        """Extrae características testeadas"""
        features = []
        
        feature_keywords = {
            'authentication': [r'login', r'signup', r'logout', r'auth', r'supabase'],
            'patient_management': [r'patient', r'create.*patient', r'edit.*patient', r'delete.*patient'],
            'clinical_session': [r'session', r'audio.*recording', r'transcri', r'report.*generation'],
            'dashboard': [r'dashboard', r'statistics', r'real.*time', r'appointment'],
            'billing': [r'billing', r'stripe', r'subscription', r'payment'],
            'google_integration': [r'google.*drive', r'drive.*integration', r'google.*sheets'],
            'search': [r'search', r'universal.*search', r'patient.*search'],
            'file_upload': [r'file.*upload', r'document.*upload', r'audio.*upload'],
            'ui_rendering': [r'ui.*render', r'layout', r'navigation', r'header'],
            'error_handling': [r'error.*handling', r'validation', r'error.*message'],
            'onboarding': [r'onboarding', r'faq', r'profile.*setup'],
        }
        
        content_lower = content.lower()
        for feature, keywords in feature_keywords.items():
            for keyword in keywords:
                if re.search(keyword, content_lower):
                    features.append(feature)
                    break
        
        return list(set(features))
    
    def _extract_endpoints(self, content):
        """Extrae endpoints API usados"""
        endpoints = []
        url_pattern = r'(?:goto|navigate|fetch|request)\s*\(\s*["\']([^"\']*)["\']'
        for match in re.finditer(url_pattern, content):
            url = match.group(1)
            if '/' in url:
                endpoints.append(url)
        return list(set(endpoints))
    
    def _extract_selectors(self, content):
        """Extrae selectores CSS/XPath usados"""
        selectors = []
        # Detecta selectores
        selector_pattern = r'(?:get_by_|query_selector|select)\s*\(\s*["\']([^"\']+)["\']'
        for match in re.finditer(selector_pattern, content):
            selectors.append(match.group(1))
        return len(selectors)
    
    def _extract_assertions(self, content):
        """Cuenta las aserciones en el test"""
        assertions = len(re.findall(r'(?:assert|expect|should|to_have|to_be)', content, re.IGNORECASE))
        return assertions
    
    def _extract_wait_conditions(self, content):
        """Identifica condiciones de espera"""
        waits = {
            'network_idle': len(re.findall(r'networkidle', content)),
            'dom_content': len(re.findall(r'domcontentloaded', content)),
            'wait_for_selector': len(re.findall(r'wait_for.*selector', content, re.IGNORECASE)),
            'explicit_wait': len(re.findall(r'wait\s*\(', content, re.IGNORECASE)),
        }
        return waits
    
    def _identify_issues(self, content):
        """Identifica posibles problemas en el test"""
        issues = []
        
        # Verificar timeout
        if len(content) < 100:
            issues.append("Test muy corto - podría ser incompleto")
        
        # Verificar falta de manejo de errores
        if 'try:' not in content:
            issues.append("Sin manejo de excepciones")
        
        # Verificar hardcoded URLs (anti-patrón)
        if re.search(r'localhost:\d+', content):
            issues.append("URLs hardcodeadas (considerar variables de entorno)")
        
        # Verificar timeouts muy cortos
        if re.search(r'timeout\s*=\s*[0-9]{1,3}[^0-9]', content):
            issues.append("Timeout potencialmente muy corto")
        
        return issues
    
    def _calculate_coverage(self, content):
        """Calcula cobertura aproximada del test"""
        assertions = self._extract_assertions(content)
        lines = len(content.split('\n'))
        endpoints = len(self._extract_endpoints(content))
        
        # Score simple: más aserciones, endpoints y líneas = mejor cobertura
        coverage_score = min(100, (assertions * 5) + (endpoints * 10) + min(50, lines / 2))
        return coverage_score
    
    def _update_results(self, test_info):
        """Actualiza resultados globales"""
        for feature in test_info["features"]:
            self.results["coverage"][feature].append(test_info["number"])
        
        for issue in test_info["issues"]:
            self.results["issues"].append(f"TC{test_info['number']:03d}: {issue}")
    
    def generate_report(self):
        """Genera reporte en formato legible"""
        print("\n" + "="*80)
        print(" AUDITORÍA TESTSPRITE - INFORIA 2.0".center(80))
        print(" Análisis Estático de Cobertura de Pruebas E2E".center(80))
        print("="*80 + "\n")
        
        print(f"📊 ESTADÍSTICAS GENERALES")
        print(f"   Total de Tests: {self.results['total_tests']}")
        print(f"   Fecha de Auditoría: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   Directorio: {self.tests_dir}\n")
        
        # Cobertura por características
        print("✅ COBERTURA DE CARACTERÍSTICAS")
        features_coverage = {
            'Authentication': ['authentication'],
            'Gestión de Pacientes': ['patient_management'],
            'Sesiones Clínicas': ['clinical_session'],
            'Dashboard': ['dashboard'],
            'Facturación': ['billing'],
            'Google Integration': ['google_integration'],
            'Búsqueda': ['search'],
            'Carga de Archivos': ['file_upload'],
            'UI/Rendering': ['ui_rendering'],
            'Manejo de Errores': ['error_handling'],
            'Onboarding': ['onboarding']
        }
        
        for feature_name, feature_keys in features_coverage.items():
            tests_covering = []
            for key in feature_keys:
                if key in self.results["coverage"]:
                    tests_covering.extend(self.results["coverage"][key])
            
            if tests_covering:
                test_str = ", ".join([f"TC{t:03d}" for t in sorted(set(tests_covering))])
                print(f"   ✓ {feature_name:25} {test_str}")
            else:
                print(f"   ✗ {feature_name:25} [SIN COBERTURA]")
        
        print("\n📈 ESTADÍSTICAS POR TEST")
        total_assertions = 0
        total_endpoints = 0
        total_coverage = 0
        
        for test in sorted(self.tests, key=lambda x: x["number"]):
            total_assertions += test["assertions"]
            total_endpoints += len(test["endpoints"])
            total_coverage += test["coverage"]
            
            status = "✅" if test["coverage"] > 60 else "⚠️" if test["coverage"] > 40 else "❌"
            print(f"   {status} TC{test['number']:03d}: {test['title'][:50]:50} | "
                  f"Cobertura: {test['coverage']:.0f}% | "
                  f"Aserciones: {test['assertions']} | "
                  f"Endpoints: {len(test['endpoints'])}")
        
        avg_coverage = total_coverage / len(self.tests) if self.tests else 0
        print(f"\n   📊 Cobertura Promedio: {avg_coverage:.1f}%")
        print(f"   📊 Total de Aserciones: {total_assertions}")
        print(f"   📊 Total de Endpoints: {total_endpoints}")
        
        # Problemas identificados
        if self.results["issues"]:
            print("\n⚠️  PROBLEMAS IDENTIFICADOS")
            for issue in self.results["issues"][:20]:  # Top 20
                print(f"   • {issue}")
            if len(self.results["issues"]) > 20:
                print(f"   ... y {len(self.results['issues']) - 20} problemas más")
        
        # Recomendaciones
        print("\n💡 RECOMENDACIONES")
        print("   1. Ejecutar tests en ambiente de CI/CD (GitHub Actions, Jenkins)")
        print("   2. Implementar TestSprite MCP para automatización continua")
        print("   3. Aumentar cobertura de tests con menos del 50%")
        print("   4. Validar endpoints API en cada test")
        print("   5. Implementar screenshots en caso de fallo")
        print("   6. Agregar tests de performance (carga, velocidad)")
        print("   7. Configurar reportes automáticos post-ejecución")
        
        print("\n" + "="*80 + "\n")
    
    def export_json_report(self, filename="audit_report.json"):
        """Exporta reporte en JSON"""
        import json
        
        export_data = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": self.results["total_tests"],
            "tests": []
        }
        
        for test in self.tests:
            export_data["tests"].append({
                "tc_number": test["number"],
                "title": test["title"],
                "lines": test["lines"],
                "coverage": test["coverage"],
                "assertions": test["assertions"],
                "features": test["features"],
                "endpoints_count": len(test["endpoints"]),
                "issues": test["issues"]
            })
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Reporte JSON exportado a: {filename}")

def main():
    auditor = TestSpriteAuditor()
    auditor.scan_tests()
    auditor.generate_report()
    auditor.export_json_report()

if __name__ == "__main__":
    main()
